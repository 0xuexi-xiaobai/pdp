from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Post(models.Model):
    status = models.IntegerField(default=0)
    title = models.CharField(max_length=255, default="general question")
    author = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    content = models.TextField(default='Empty article')
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, default='General')
    image = models.ImageField(upload_to='posts/', null=True, blank=True)

    def __str__(self):
        return f'id={self.id}, content="{self.content}"'


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    credit = models.IntegerField(default=100)

    def __str__(self):
        return self.user.username


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=16, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    position = models.CharField(max_length=100, blank=True)
    hospital = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to='doctor_photos', blank=True)
    credit = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    consultations = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username


class Comment(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='comments/', null=True, blank=True)


class Article(models.Model):
    title = models.CharField(max_length=255, default="general question")
    author = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    content = models.TextField(default='Empty article')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, default='General')
    image = models.ImageField(upload_to='Articles/', null=True, blank=True)

    def __str__(self):
        return self.title
