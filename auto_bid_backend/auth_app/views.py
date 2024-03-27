from pathlib import Path
import os
from dotenv import load_dotenv
from django.http import JsonResponse
from allauth.account.views import ConfirmEmailView
from django.shortcuts import redirect

load_dotenv()

frontend_url = os.getenv('FRONTEND_URL')

class CustomConfirmEmailView(ConfirmEmailView):
    def get(self, *args, **kwargs):
        try:
            confirmation = self.get_object()
            confirmation.confirm(self.request)
        except Exception as e: 
            print('Email confirmation failed:', str(e))

            return redirect(f'{frontend_url}/pages/confirm-error')    
        else:
            return redirect(f'{frontend_url}/pages/login')

    # Override this method to prevent template rendering
    def render_to_response(self, context, **response_kwargs):
        return self.response_class(data=context, **response_kwargs)
