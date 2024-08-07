import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import Axios from 'axios'
import { useAuth } from 'src/@core/context/authContext'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Pagination from '@mui/material/Pagination'
import CircularProgress from '@mui/material/CircularProgress'
import { API_BASE_URL } from 'src/configs/apiConfig'
import { Alert, AlertTitle } from '@mui/material'

interface AnswerType {
    id: number;
    profile: string;
    inputType: string;
    question: string;
    answer: string;
}

interface Error {
    [key: string]: string[]
}

const AutoBidAnswers = () => {
    const [values, setValues] = useState<AnswerType[]>([]);
    const [initialValues, setInitialValues] = useState<AnswerType[]>([]);
    const [updatedValues, setUpdatedValues] = useState<Partial<AnswerType>[]>([]);
    const [message, setMessage] = useState<string>('')
    const [error, setError] = useState<Error | null>(null)
    const [alertIsOpen, setAlertOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const { token } = useAuth()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchAnswers = async () => {
            setLoading(true);
            try {
                const response = await Axios.get(`${API_BASE_URL}/auto-bid/get-answers`);
                if (response.data?.answers && response.data.answers.length > 0) {
                    const sortedAnswers = response.data.answers.sort((a: AnswerType, b: AnswerType) => a.id - b.id);
                    setValues(sortedAnswers);
                    setInitialValues(sortedAnswers);
                    setUpdatedValues([]);
                } else {
                    setValues([]);
                    setInitialValues([]);
                    setUpdatedValues([]);
                }
            } catch (error) {
                if (Axios.isAxiosError(error) && error.response) {
                    setError(error.response.data);
                } else {
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnswers();
    }, [token]);

    const handleChange = (id: number) => (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setValues(prevValues =>
            prevValues.map(val =>
                val.id === id ? { ...val, [name]: value } : val
            )
        );

        // Track changes
        setUpdatedValues(prevUpdatedValues => {
            const updated = prevUpdatedValues.find(val => val.id === id);
            if (updated) {
                return prevUpdatedValues.map(val =>
                    val.id === id ? { ...val, [name]: value } : val
                );
            } else {
                return [...prevUpdatedValues, { id, [name]: value }];
            }
        });
    };

    const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        try {
            const response = await Axios.post(`${API_BASE_URL}/auto-bid/update-answers/`, { answers: updatedValues });

            setMessage(response.data.message);
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 3000); // Close alert after 3 seconds
            setUpdatedValues([]); // Reset updated values after successful submission
        } catch (error) {
            if (Axios.isAxiosError(error) && error.response) {
                setError(error.response.data);
            } else {
                console.error(error);
            }
        }
    };

    const handleReset = () => {
        setValues(initialValues);
        setUpdatedValues([]);
        setMessage('');
        setAlertOpen(false);
        setError(null);
    };

    const handlePageChange = (event: ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    // Calculate the current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = values.slice(indexOfFirstItem, indexOfLastItem);

    // Check if the Reset button should be enabled
    const isResetEnabled = JSON.stringify(values) !== JSON.stringify(initialValues);

    return (
        <Card>
            <CardHeader title='Update Auto Bid Answers' titleTypographyProps={{ variant: 'h6' }} />
            <Divider sx={{ margin: 0 }} />
            {loading ? (
                <CardContent sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                </CardContent>
            ) : (
                <>
                    <form onSubmit={e => e.preventDefault()}>
                        <CardContent>
                            <Grid container spacing={2}>
                                {currentItems.map((answer, index) => (
                                    <Grid item xs={12} sm={6} key={answer.id}>
                                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                            {index + 1 + indexOfFirstItem}. {answer.question}
                                        </Typography>
                                        <TextField
                                            name='answer'
                                            fullWidth
                                            label={answer.question}
                                            value={answer.answer}
                                            onChange={handleChange(answer.id)}
                                            multiline={answer.inputType === 'textarea'}
                                            rows={answer.inputType === 'textarea' ? 3 : 1}
                                            sx={{ marginTop: 2 }}
                                            size='small'
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                        <Divider sx={{ margin: 0 }} />
                        <CardActions>
                            <Button
                                size='large'
                                sx={{ mr: 2 }}
                                variant='contained'
                                onClick={handleSubmit}
                                disabled={updatedValues.length === 0}
                            >
                                Save
                            </Button>
                            <Button
                                size='large'
                                color='secondary'
                                variant='outlined'
                                onClick={handleReset}
                                disabled={!isResetEnabled}
                            >
                                Reset
                            </Button>
                        </CardActions>
                    </form>
                    <CardContent>
                        <Pagination
                            count={Math.ceil(values.length / itemsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </CardContent>
                </>
            )}
            {alertIsOpen && <Alert onClose={() => setAlertOpen(false)}>{message}</Alert>}
            {error && <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {Object.entries(error).map(([key, value]) => (
                    <div key={key}>{key}: {Array.isArray(value) ? value.join(', ') : value}</div>
                ))}
            </Alert>}
        </Card>
    )
}

export default AutoBidAnswers;