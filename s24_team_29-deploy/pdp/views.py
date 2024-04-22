import json
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
import pytz
from django.utils.dateparse import parse_datetime
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.http import Http404
from .forms import PatientRegisterForm, DoctorRegisterForm, PostForm, Comment
from .models import Post, PatientProfile, DoctorProfile, Category
from rest_framework import viewsets
from .models import Article
from .serializers import ArticleSerializer, PostSerializer, CommentSerializer, CategorySerializer, \
    DoctorProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
def rate_doctor(request, doctor_id):
    """
    Rate a doctor by updating their average rating.
    """
    try:
        doctor_profile = get_object_or_404(DoctorProfile, user__id=doctor_id)
        new_rating = request.data.get('new_rating')

        # Calculate the new average rating
        total_ratings = doctor_profile.rating * doctor_profile.consultations
        total_ratings += new_rating
        doctor_profile.consultations += 1
        doctor_profile.rating = total_ratings / doctor_profile.consultations

        # Save the updated profile
        doctor_profile.save()

        return Response({'status': 'success', 'new_rating': doctor_profile.rating})
    except Exception as e:
        # Handle any exceptions, such as DoctorProfile not existing
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DoctorDetailView(APIView):
    """
    Retrieve a doctor's profile by their user ID.
    """
    def get(self, request, id):
        doctor = get_object_or_404(DoctorProfile, user__id=id)
        serializer = DoctorProfileSerializer(doctor)
        return Response(serializer.data)


class DoctorListView(APIView):
    """
    List all doctors or filter by category.
    """
    def get(self, request):
        category = request.query_params.get('category', None)
        if category:
            doctors = DoctorProfile.objects.filter(category=category)
        else:
            doctors = DoctorProfile.objects.all()
        serializer = DoctorProfileSerializer(doctors, many=True)
        return Response(serializer.data)


class ArticleListView(viewsets.ViewSet):
    """
    A ViewSet for listing or creating articles.
    """
    def create(self, request):
        print(request.data)
        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.data)
            print('error here')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        queryset = Article.objects.all()
        serializer = ArticleSerializer(queryset, many=True)
        return Response(serializer.data)


class PostViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing or creating posts.
    """

    def list(self, request):
        queryset = Post.objects.all()
        serializer = PostSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            print()
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f'Post {post.pk} updated successfully')
            return Response(serializer.data)
        else:
            logger.error(f'Error updating post {post.pk}: {serializer.errors}')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentCreateAPIView(APIView):
    """
    Create a new comment on a post.
    """

    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(id=request.data['user'])
            serializer.save(author=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet for listing categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class PatientLoginView(APIView):
    """
    Login a patient and return a token.
    """
    def get(self, request, *args, **kwargs):
        user = request.user
        if user.is_authenticated:
            patient_profile = PatientProfile.objects.get(user=user)
            token, _ = Token.objects.get_or_create(user=user)
            data = {
                'message': 'Patient is already logged in.',
                'user': {
                    'name': user.get_full_name(),
                    'email': user.email,
                    'credit': patient_profile.credit,
                    'id': user.id,
                    'role': 'patient',
                },
                'token': token.key
            }
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "User is not logged in. Please login using POST."}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if hasattr(user, 'patientprofile'):
                login(request, user)
                patient_profile = PatientProfile.objects.get(user=user)
                token, _ = Token.objects.get_or_create(user=user)
                data = {
                    'message': 'Patient logged in successfully.',
                    'user': {
                        'name': user.get_full_name(),
                        'email': user.email,
                        'credit': patient_profile.credit,
                        'id': user.id,
                        'role': 'patient',
                    },
                    'token': token.key
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Invalid credentials. User is not a registered patient."},
                                status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)


class DoctorLoginView(APIView):
    """
    Login a doctor and return a token.
    """
    def get(self, request, *args, **kwargs):
        user = request.user
        if user.is_authenticated:
            doctor_profile = DoctorProfile.objects.get(user=user)
            token, _ = Token.objects.get_or_create(user=user)
            data = {
                'message': 'Doctor is already logged in.',
                'user': {
                    'name': user.get_full_name(),
                    'email': user.email,
                    'credit': doctor_profile.credit,
                    'id': user.id,
                    'role': 'doctor',
                    'rating': doctor_profile.rating,
                    'consultations': doctor_profile.consultations,
                },
                'token': token.key
            }
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "User is not logged in. Please login using POST."},
                            status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if hasattr(user, 'doctorprofile'):
                login(request, user)
                doctor_profile = DoctorProfile.objects.get(user=user)
                token, _ = Token.objects.get_or_create(user=user)
                data = {
                    'message': 'Doctor logged in successfully.',
                    'user': {
                        'name': user.get_full_name(),
                        'email': user.email,
                        'credit': doctor_profile.credit,
                        'id': user.id,
                        'role': 'doctor',
                    },
                    'token': token.key
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Invalid credentials. User is not a registered doctor."},
                                status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)


class PatientRegisterView(APIView):
    """
    Register a new patient and return a token.
    
    """
    def post(self, request, *args, **kwargs):
        print(111)
    def post(self, request, *args, **kwargs):
        form = PatientRegisterForm(request.data)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            username = cleaned_data.get('username')
            password = cleaned_data.get('password')
            email = cleaned_data.get('email')
            phone_number = cleaned_data.get('phone_number')
            first_name = cleaned_data.get('first_name')
            last_name = cleaned_data.get('last_name')
            age = cleaned_data.get('age')
            gender = cleaned_data.get('gender')

            user = User.objects.create_user(username=username, password=password, email=email,
                                            first_name=first_name, last_name=last_name)
            patient_profile = PatientProfile.objects.create(user=user, phone_number=phone_number,
                                                            age=age, gender=gender)
            authenticated_user = authenticate(username=username, password=password)
            if authenticated_user is not None:
                token, _ = Token.objects.get_or_create(user=user)
                data = {
                    'message': 'Patient registered successfully.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'phone_number': patient_profile.phone_number,
                        'age': patient_profile.age,
                        'gender': patient_profile.gender
                    },
                    'token': token.key
                }
                return Response(data, status=status.HTTP_201_CREATED)
            else:
                user.delete()
                return Response({'error': 'Authentication failed.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorRegisterView(APIView):
    """
    Register a new doctor and return a token.
    """
    def post(self, request, *args, **kwargs):
        form = DoctorRegisterForm(request.data, request.FILES)
        print('form here')
        print(form)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            username = cleaned_data.get('username')
            password = cleaned_data.get('password')
            first_name = cleaned_data.get('first_name')
            last_name = cleaned_data.get('last_name')
            email = cleaned_data.get('email')
            phone_number = cleaned_data.get('phone_number')
            category_name = cleaned_data.get('category')
            position = cleaned_data.get('position')
            hospital = cleaned_data.get('hospital')
            address = cleaned_data.get('address')
            city = cleaned_data.get('city')
            state = cleaned_data.get('state')
            photo = cleaned_data.get('photo')

            user = User.objects.create_user(username=username, password=password, email=email,
                                            first_name=first_name, last_name=last_name)

            category, _ = Category.objects.get_or_create(name=category_name)

            doctor_profile = DoctorProfile.objects.create(user=user, phone_number=phone_number,
                                                          category=category, position=position,
                                                          hospital=hospital, address=address, city=city,
                                                          state=state, photo=photo)
            authenticated_user = authenticate(username=username, password=password)
            if authenticated_user is not None:
                token, _ = Token.objects.get_or_create(user=user)
                data = {
                    'message': 'Doctor registered successfully.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'phone_number': doctor_profile.phone_number,
                        'category': doctor_profile.category.name,
                        'position': doctor_profile.position,
                        'hospital': doctor_profile.hospital,
                        'address': doctor_profile.address,
                        'city': doctor_profile.city,
                        'state': doctor_profile.state,
                        'photo_url': doctor_profile.photo.url if doctor_profile.photo else None
                    },
                    'token': token.key
                }
                return Response(data, status=status.HTTP_201_CREATED)
            else:
                user.delete()
                return Response({'error': 'Authentication failed.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print('question here?')
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorDetailsView(APIView):
    """
    Retrieve a doctor's profile.
    """
    def get(self, request, *args, **kwargs):
        try:
            doctor_profile = DoctorProfile.objects.get(user_id=7)
            serializer = DoctorProfileSerializer(doctor_profile)
            return Response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor profile not found.'}, status=404)


@login_required
def get_user_data(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    try:
        # Try to fetch patient profile
        patient_profile = PatientProfile.objects.get(user=user)
        data = {
            'message': 'User is logged in as a patient.',
            'user': {
                'name': user.get_full_name(),
                'email': user.email,
                'credit': patient_profile.credit,
                'id': user.id,
                'role': 'patient'
            }
        }
        return JsonResponse(data)

    except PatientProfile.DoesNotExist:
        pass  # If no patient profile, try doctor profile

    try:
        # Try to fetch doctor profile
        doctor_profile = DoctorProfile.objects.get(user=user)
        data = {
            'message': 'User is logged in as a doctor.',
            'user': {
                'name': user.get_full_name(),
                'email': user.email,
                'credit': doctor_profile.credit,
                'id': user.id,
                'speciality': doctor_profile.category.name,
                'role': 'doctor',
                'rating': doctor_profile.rating,
                'consultations': doctor_profile.consultations,
            }
        }
        return JsonResponse(data)

    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'User profile not found.'}, status=404)


@require_http_methods(["PUT"])
@permission_classes([IsAuthenticated])
def update_user_credit(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        data = json.loads(request.body)
        new_credit = data.get('credit')

        # Update the credit value in the associated PatientProfile
        try:
            profile = PatientProfile.objects.get(user=user)

            profile.credit = new_credit
            profile.save()
            data = {
                'message': 'Credit updated successfully.',
                'user': {
                    'name': user.get_full_name(),
                    'email': user.email,
                    'credit': profile.credit,
                    'id': user.id,
                    'role': 'patient',
                },
            }
            return JsonResponse(data, status=200)
        except Exception:
            pass
        try:

            profile = DoctorProfile.objects.get(user=user)
            profile.credit = new_credit
            profile.save()
            data = {
                'message': 'Credit updated successfully.',
                'user': {
                    'name': user.get_full_name(),
                    'email': user.email,
                    'credit': profile.credit,
                    'id': user.id,
                    'role': 'doctor',
                },
            }
            return JsonResponse(data, status=200)
        except:
            pass
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def patient_logout(request):
    logout(request)
    return redirect(reverse('login'))


def doctor_logout(request):
    logout(request)
    return redirect(reverse('doctor_login'))


def global_stream_view(request):
    posts = Post.objects.all().order_by('-created_at')  # sort by time

    categories = Category.objects.all()  # Category

    return render(request, 'pdp/post_global.html', {'posts': posts, 'categories': categories})


def article_stream_view(request):
    return render(request, 'pdp/articles.html')


@login_required
def create_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST, author=request.user)
        if form.is_valid():
            category_id = request.POST.get('category')
            category = get_object_or_404(Category, pk=category_id)

            post = form.save(commit=False)
            post.author = request.user
            post.save()

            # Convert post object to dictionary
            post_data = model_to_dict(
                post, fields=['id', 'content', 'author', 'created_at'])
            # Assuming you want the username in the response
            post_data['id'] = post.id
            # Assuming you want the username in the response
            post_data['author'] = post.author.username
            post_data['first_name'] = post.author.first_name
            post_data['last_name'] = post.author.last_name
            post_data['category'] = post.category.name

            # Convert the created_at time to US Eastern time zone
            us_eastern_tz = pytz.timezone('US/Eastern')
            us_eastern_time = post.created_at.astimezone(us_eastern_tz)

            # Format the time as a string without leading zeros
            formatted_time = us_eastern_time.strftime('%#m/%#d/%Y %#I:%M %p')
            post_data['created_at'] = formatted_time

            return JsonResponse({'success': True, 'post': post_data})
        else:
            return JsonResponse({'success': False, 'errors': form.errors.as_json()})
    else:
        return JsonResponse({'success': False, 'errors': 'Invalid request method'})


def add_comment(request):
    """
    Handles the addition of a new comment to a post.
    """
    try:
        if request.method == 'POST':
            comment_text = request.POST.get('comment_text')
            post_id = request.POST.get('post_id')

            if not comment_text or not post_id:
                print('comment_text or not post_id')
                return JsonResponse({'error': 'Missing comment_text or post_id'}, status=400)
            try:
                post_id = int(post_id)
            except ValueError:
                return JsonResponse({'error': 'Invalid post_id. post_id must be a number.'}, status=400)

            try:
                post = get_object_or_404(Post, id=post_id)
            except Http404:
                return JsonResponse({'error': 'Post does not exist'}, status=400)

            if request.user.is_authenticated:
                comment = Comment(text=comment_text,
                                  author=request.user, post=post)
                comment.save()
                comment.author = request.user
                comment.post = post
                comment.save()
                comment_data = model_to_dict(comment, fields=['id', 'text', 'author', 'created_at'])
                comment_data['post_id'] = post.id
                comment_data['last_name'] = comment.author.last_name
                comment_data['first_name'] = comment.author.first_name
                comment_data['text'] = comment.text
                comment_data['username'] = comment.author.username

                us_eastern_tz = pytz.timezone('US/Eastern')
                us_eastern_time = comment.created_at.astimezone(us_eastern_tz)
                # Format the time as a string without leading zeros
                formatted_time = us_eastern_time.strftime(
                    '%#m/%#d/%Y %#I:%M %p')
                comment_data['created_at'] = formatted_time

                return JsonResponse(
                    {'success': True, 'comment': comment_data})
            else:
                return JsonResponse({'error': 'User not logged in'}, status=401)
        else:
            return JsonResponse({'error': 'POST request required'},
                                status=405)

    except Exception as e:
        return JsonResponse({'error': 'Internal Server Error'}, status=500)


def fetch_posts(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not logged in.'}, status=401)
        last_update = request.GET.get('last_update', None)

        if last_update:
            last_update_dt = parse_datetime(last_update)
            # ensure format
            if last_update_dt:
                new_posts = Post.objects.filter(
                    created_at__gt=last_update_dt).prefetch_related('comments')
            else:
                # incorrect format
                return JsonResponse({'error': 'Invalid last_update format.'}, status=400)
        else:
            new_posts = Post.objects.all().prefetch_related('comments')

        us_eastern_tz = pytz.timezone('US/Eastern')
        posts_data = [{
            'id': post.id,
            'author': request.user.id,
            'author_username': post.author.username,
            'author_first_name': post.author.first_name,
            'author_last_name': post.author.last_name,
            'created_at': post.created_at.astimezone(us_eastern_tz).strftime('%#m/%#d/%Y %#I:%M %p'),
            'content': post.content,
            'comments': [{
                'id': comment.id,
                'text': comment.text,
                'author_username': comment.author.username,
                'author_first_name': comment.author.first_name,
                'author_last_name': comment.author.last_name,
                'created_at': comment.created_at.astimezone(us_eastern_tz).strftime('%#m/%#d/%Y %#I:%M %p'),
            } for comment in post.comments.all()]
        } for post in new_posts]
        return JsonResponse({'posts': posts_data})
    return JsonResponse({'error': 'GET request required.'}, status=400)
