"""
URL configuration for webapps project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls.py import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls.py'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from pdp import views
from django.conf.urls.static import static

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('api/articles/', views.ArticleListView.as_view({'get': 'list', 'post': 'create'}), name='article-list'),
    path('api/posts/', views.PostViewSet.as_view({'get': 'list', 'post': 'create'}), name='post-list'),
    path('api/posts/<int:pk>/', views.PostViewSet.as_view({'patch':'partial_update'}), name='post-update'),
    path('api/categories/', views.CategoryViewSet.as_view({'get': 'list'}), name='category'),
    path('api/comments/', views.CommentCreateAPIView.as_view(), name='create-comment'),
    path('api/doctors/', views.DoctorListView.as_view(), name='api_doctors'),
    path("admin/", admin.site.urls),
    path('api/user/', views.get_user_data, name='user-data'),
    path('api/users/<int:user_id>/update_credit/', views.update_user_credit, name='update_user_credit'),
    path('api/rate-doctor/<int:doctor_id>/', views.rate_doctor, name='rate-doctor'),
    path('api/doctors/<int:id>/', views.DoctorDetailView.as_view(), name='view-doctor'),
    path('', include('pdp.urls')),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
