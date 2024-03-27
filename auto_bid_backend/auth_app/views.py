from django.http import JsonResponse
from allauth.account.views import ConfirmEmailView
from django.shortcuts import redirect

class CustomConfirmEmailView(ConfirmEmailView):
    def get(self, *args, **kwargs):
        try:
            confirmation = self.get_object()
            confirmation.confirm(self.request)
        except Exception as e: 
            print('Email confirmation failed:', str(e))

            return redirect('http://localhost:3000/pages/confirm-error')    
        else:
            return redirect('http://localhost:3000/pages/login')

    # Override this method to prevent template rendering
    def render_to_response(self, context, **response_kwargs):
        print('RENDER_TO_RESPONSE')
        return self.response_class(data=context, **response_kwargs)
