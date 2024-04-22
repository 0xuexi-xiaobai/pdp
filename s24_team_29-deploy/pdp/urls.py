from django.urls import path
from pdp import views


urlpatterns = [
    # login, register and logout
    path('accounts/patient-login/', views.PatientLoginView.as_view(), name='patient_login'),
    path('accounts/doctor-login/', views.DoctorLoginView.as_view(), name='doctor_login'),
    path('accounts/patient-register/', views.PatientRegisterView.as_view(), name='patient_register'),
    path('accounts/doctor-register/', views.DoctorRegisterView.as_view(), name='doctor_register'),
    path('doctor-logout/', views.doctor_logout, name='doctor_logout'),
    path('patient-logout', views.patient_logout, name='patient_logout'),

    # home page
    path('global/', views.global_stream_view, name='global'),
    path('article/', views.article_stream_view, name='article'),
    path('create-post/', views.create_post, name='create_post'),
    path('add-comment/', views.add_comment, name='add-comment'),
    path('fetch-posts/', views.fetch_posts, name='fetch_posts'),
]
 
 