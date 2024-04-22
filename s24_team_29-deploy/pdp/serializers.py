from rest_framework import serializers
from .models import Article, Post, Comment, Category, DoctorProfile


# class ArticleSerializer(serializers.ModelSerializer):
#     category_name = serializers.CharField(source='category.name', read_only=True)

#     class Meta:
#         model = Article
#         fields = ['title', 'content', 'category', 'category_name']
class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, allow_blank=True, required=False)
    image = serializers.ImageField(max_length=None, allow_empty_file=True, use_url=True, required=False)
    
    class Meta:
        model = Article
        fields = ['id', 'title', 'author', 'content', 'category_name', 'image']
    def create(self, validated_data):
        category_name = validated_data.pop('category_name', None)
        category = None
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
        else:
            # Optionally handle the case where no category_name is provided
            # For instance, assign a default category or leave it as None
            category = Category.objects.get_or_create(name="General")[0]

        validated_data['category'] = category
        article = Article.objects.create(**validated_data)
        return article

    def to_representation(self, instance):
        """
        Because category_name is write_only, need to explicitly
        add it to the representation if  want it included in read operations.
        """
        representation = super(ArticleSerializer, self).to_representation(instance)
        representation['category_name'] = instance.category.name if instance.category else None
        return representation

    def validate_category_name(self, value):
        # Your validation logic here
        # check if the category name meets certain conditions
        # If not, raise a serializers.ValidationError
        if value and not Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("This category does not exist.")
        return value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class DoctorProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    category = serializers.CharField(source='category.name')
    user_id=serializers.IntegerField(source='user.id')
    class Meta:
        model = DoctorProfile
        fields = ['id', 'first_name', 'last_name', 'phone_number', 'category', 'position', 'hospital', 'address',
                  'city', 'state', 'photo', 'rating', 'consultations','user_id','credit']
    

class CommentSerializer(serializers.ModelSerializer):
    # author = serializers.ReadOnlyField(source='author.username')  # Assuming you have a username field
    image = serializers.ImageField(max_length=None, allow_empty_file=True, use_url=True, required=False)
    author_name = serializers.SerializerMethodField()

    def get_author_name(self, obj):
        return obj.author.username if obj.author else None

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'text', 'created_at', 'image', 'author_name']

    def create(self, validated_data):
        # Handle image file if included in validated_data
        return Comment.objects.create(**validated_data)


class PostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, allow_blank=True, required=False)
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(max_length=None, allow_empty_file=True, use_url=True, required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'content', 'created_at', 'category_name', 'comments', 'image','status']

    def create(self, validated_data):
        # Handle category_name for creating a new Post
        category_name = validated_data.pop('category_name', None)
        category = None
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
        else:
            # Optionally handle the case where no category_name is provided
            # For instance, assign a default category or leave it as None
            category = Category.objects.get_or_create(name="General")[0]

        post = Post.objects.create(**validated_data, category=category)
        return post

    def update(self, instance, validated_data):
        # Update other fields as necessary
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        """
        Because category_name is write_only, need to explicitly
        add it to the representation if  want it included in read operations.
        """
        representation = super(PostSerializer, self).to_representation(instance)
        representation['category_name'] = instance.category.name if instance.category else None
        return representation

    def validate_category_name(self, value):
        # Your validation logic here
        # check if the category name meets certain conditions
        # If not, raise a serializers.ValidationError
        if value and not Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("This category does not exist.")
        return value
