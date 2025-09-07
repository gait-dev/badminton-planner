from rest_framework import serializers
from .models import User, Purchase

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'license_number', 'role', 'age', 'reductions')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class PurchaseSerializer(serializers.ModelSerializer):
    type_display = serializers.SerializerMethodField()

    def get_type_display(self, obj):
        return obj.get_type_display()

    class Meta:
        model = Purchase
        fields = ('id', 'type', 'type_display', 'quantity', 'amount', 'paid', 'paid_at', 'created_at', 'user')
        read_only_fields = ('created_at',)
