import csv
from jobspy import scrape_jobs
import asyncio
import aiohttp
from bs4 import BeautifulSoup, Comment
import random
from urllib.parse import urlparse, parse_qs


def generate_random_user_agent():
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
        'Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.77 Mobile/15E148 Safari/604.1',
        # Add more User-Agents if needed
    ]
    return random.choice(user_agents)

def get_data_from_linkedin(soup, url):
    company_name = soup.find('a', {'data-tracking-control-name': 'public_jobs_topcard-org-name'})
    if company_name:
        company_url = company_name['href']
    
    job_title = soup.find('h1', class_='top-card-layout__title').text.strip()
    # if job_title:
    #     print(job_title.text.strip())
        
    job_description = soup.find('div', class_='show-more-less-html__markup').text.strip()
    # if job_description:
    #     print(job_description.text.strip())
    job_url = url
    apply_url_element = soup.find(id='applyUrl')
    if apply_url_element:
        comment = apply_url_element.find(string=lambda text: isinstance(text, Comment))
        if comment:
            # Remove the comment markers (<!-- and -->) and extra quotes
            comment_text = comment.strip('"')
            # Now you can parse the URL as needed
            parsed_url = urlparse(comment_text)
            query_params = parse_qs(parsed_url.query)
            job_url = query_params.get('url', [None])[0]
    return {
        'company_name': company_name,
        'company_url': company_url,
        'job_title': job_title,
        'job_description': job_description,
        'job_url': job_url
    }
    
def fetch_with_retry(url, retries=3, retry_delay=3):
    try:
        headers = {'User-Agent': generate_random_user_agent()}
        with aiohttp.ClientSession() as session:
            with session.get(url, headers=headers) as response:
                if response.status in [429, 403] and retries > 0:
                    print(f"Request rate limited or forbidden. Retrying in {retry_delay} seconds...")
                    asyncio.sleep(retry_delay)
                    return fetch_with_retry(url, retries - 1, retry_delay)
                else:
                    response.raise_for_status()
                    return response.text()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_job_url_direct(jobs):
    for index, job in jobs.iterrows():
        job_dict = job.to_dict()
        if job_dict['site'] == 'linkedin':
            html_content = fetch_with_retry(job_dict['job_url'])
            if html_content:
                soup = BeautifulSoup(html_content, 'html.parser')
                data = get_data_from_linkedin(soup, job_dict['job_url'])
                jobs.at[index, 'job_url_direct'] = data['job_url']
                jobs.at[index, 'description'] = data['job_description']
    return jobs


# print(f"Found {len(jobs)} jobs")


def scrape_jobs_modified(site_name, search_term, location, is_remote, hours_old, country_indeed, results_wanted):
    jobs = scrape_jobs(
        # site_name=["indeed", "linkedin", "zip_recruiter", "glassdoor"],
        site_name=[site_name],
        search_term=search_term,
        location=location,
        is_remote=is_remote,
        hours_old=hours_old, # (only Linkedin/Indeed is hour specific, others round up to days old)
        country_indeed=country_indeed,  # only needed for indeed / glassdoor
        results_wanted=results_wanted
    )

    if site_name == 'linkedin':
        jobs = get_job_url_direct(jobs)
    return jobs

