from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user


class DocumentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Document
        fields = ('id', 'user', 'file', 'original_filename', 'extracted_text', 'uploaded_at')
        read_only_fields = ('extracted_text', 'uploaded_at', 'original_filename')

    def create(self, validated_data):
        validated_data['original_filename'] = validated_data['file'].name
        return super().create(validated_data)
