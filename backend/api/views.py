from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Purchase
from .serializers import UserSerializer, PurchaseSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        print('\nLogin attempt with:', request.data)
        try:
            # Vérifier si l'identifiant est un email
            identifier = request.data.get('username')
            if '@' in identifier:
                try:
                    user = User.objects.get(email=identifier)
                    request.data['username'] = user.username
                except User.DoesNotExist:
                    pass

            response = super().post(request, *args, **kwargs)
            print('Login response:', response.status_code, response.data if hasattr(response, 'data') else '')
        except Exception as e:
            print('Login error:', str(e))
            raise

        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            response.data['user'] = UserSerializer(user).data
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print('\nHeaders:', self.request.headers)
        print('User:', self.request.user, 'Auth:', self.request.user.is_authenticated)
        print('Auth header:', self.request.headers.get('Authorization'))
        if self.request.user.role == 'admin':
            return Purchase.objects.all()
        return Purchase.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save()
