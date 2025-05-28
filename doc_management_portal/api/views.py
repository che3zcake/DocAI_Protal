from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Document
from .serializers import UserSerializer, DocumentSerializer
from .ai_utils import extract_text_from_file, get_ai_answer
from rest_framework_simplejwt.tokens import RefreshToken


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        user_data = serializer.data

        response_data = {
            **user_data,
            **tokens
        }

        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        doc_instance = serializer.save(user=self.request.user)
        # Extract text after saving the file
        if doc_instance.file:
            try:
                extracted_text = extract_text_from_file(doc_instance.file)
                doc_instance.extracted_text = extracted_text
                doc_instance.save()
            except Exception as e:
                print(f"Error during text extraction for {doc_instance.file.name}: {e}")
                doc_instance.extracted_text = f"Error during text extraction: {e}"
                doc_instance.save()

    @action(detail=True, methods=['post'])
    def ask_question(self, request, pk=None):
        document = self.get_object()
        if not document.extracted_text:
            return Response({'error': 'Text not extracted from this document yet or extraction failed.'},
                            status=status.HTTP_400_BAD_REQUEST)

        question = request.data.get('question')
        if not question:
            return Response({'error': 'Question not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        answer = get_ai_answer(document.extracted_text, question)
        return Response({'question': question, 'answer': answer})
