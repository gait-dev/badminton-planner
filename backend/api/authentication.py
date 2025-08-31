from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        print('\nAttempting JWT auth')
        print('Headers:', request.headers)
        result = super().authenticate(request)
        print('Auth result:', result)
        return result
