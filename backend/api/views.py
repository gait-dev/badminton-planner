from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Purchase
from .serializers import UserSerializer, PurchaseSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

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

    @action(detail=False, methods=['GET'], permission_classes=[IsAdminUser])
    def users(self, request):
        users = User.objects.all().order_by('last_name', 'first_name')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], permission_classes=[IsAdminUser])
    def create_purchase(self, request):
        data = request.data.copy()
        try:
            user = User.objects.get(id=data.get('user_id'))
            data['user'] = user.id
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
