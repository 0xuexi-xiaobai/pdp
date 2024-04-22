import React from 'react';
import axios from 'axios';
import { ProList } from '@ant-design/pro-components';
import { Tag, Button, Select, message, Form, Typography, Input, Checkbox } from 'antd';
import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormRate, ProFormUploadButton } from '@ant-design/pro-form';
import { useUser } from '../contexts/UserContext';

const { Title } = Typography;

const CustomHeaderTitle = () => (
    <Title level={3} style={{ fontSize: '20px', color: '#1890ff' }}>
        Past consultation conversations
    </Title>
);


const PostList = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const [activePostId, setActivePostId] = useState(null);
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const [formComment] = Form.useForm();
    const [visibleRatingModal, setVisibleRatingModal] = useState(false);
    const [ratingForm] = Form.useForm();
    const { user, updateUser } = useUser();
    const [query, setQuery] = useState('')
    const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);


    async function updatePostStatus(post, newStatus) {
        const url = `http://localhost:8000/api/posts/${post}/`;
        const data = { status: newStatus };
        const config = {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        };

        try {
            const response = await axios.patch(url, data, config);
            console.log('Status Updated:', response.data);
        } catch (error) {
            console.error('Error updating post status:', error);
        }
    }
    useEffect(() => {

        if (!user) {
            console.log("User data is not available yet.");
            return; // User data not loaded yet
        }

        if (user.role !== 'patient') {
            console.log(user)
            message.error("You are not authorized to view this page.");
            return; // Exit if not a patient
        }
        console.log(user)

        fetchPosts();

        fetchCategories();
        const intervalId = setInterval(fetchPosts, 5000);

        return () => clearInterval(intervalId);

    }, [user]);

    const handleAddComment = async ({ text, post, image, author }) => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('post', post);
        formData.append('user', user.id);
        formData.append('user_name', user.name);
        if (image) {
            formData.append('image', image[0].originFileObj);
        }


        try {
            const response = await axios.post('http://localhost:8000/api/comments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updatePostStatus(post, 0);
            message.success('Comment added successfully');
            formComment.resetFields();
            setIsCommentModalVisible(false);
            fetchPosts();
        } catch (error) {
            console.error('Failed to add the comment', error.response.data);
            message.error('Failed to add the comment');
        }
    };


    const handleRateSubmit = async (values, doctorId, postId,post_author) => {
        try {
            console.log("Sending rating:", values.rating, "to doctor ID:", doctorId);
            const response = await axios.post(`http://localhost:8000/api/rate-doctor/${doctorId}/`, {
                new_rating: values.rating,
            });
            console.log('Rating Data:', response.data);
            updatePostStatus(postId, 2);
            setVisibleRatingModal(false);
            message.success('Rating submitted successfully');
        } catch (error) {
            console.error('Failed to submit rating:', error);
            message.error('Not allowed to rate');
        }
    };
    const openRatingModal = (postId) => {
        setActivePostId(postId);
        setVisibleRatingModal(true);
    };
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/categories/');
            const categoriesData = response.data.map(category => ({
                label: category.name,
                value: category.name,
            }));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchPosts = async () => {
        try {

            const response = await axios.get('http://localhost:8000/api/posts/');
            console.log(response)
            const fetchedPosts = response.data.map(post => ({
                status: post.status,
                id: post.id,
                comments: post.comments || [],
                title: post.title,
                content: post.content,
                category_name: post.category_name || 'General',
                isExpanded: false,
                image: post.image,
                author: post.author,
                hasComments: post.comments.length > 0
            }));
            console.log(fetchedPosts);

            // Reverse the order of the fetched posts
            const reversedPosts = fetchedPosts.reverse();

            setPosts(reversedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            message.error('Failed to fetch posts');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) &&
        (!selectedCategory || post.category_name === selectedCategory || selectedCategory === 'General') &&
        (!showMyPostsOnly || post.author === user.id)
    );

    const createPost = async (values, authorid) => {
        if (user.credit >= 10) {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('content', values.content);
            formData.append('category_name', values.category);
            formData.append('author', authorid);
            if (values.image) {
                formData.append('image', values.image[0].originFileObj);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            try {
                const response = await axios.post('http://localhost:8000/api/posts/', formData, config, {
                    withCredentials: true
                });

                if (response.status === 201 || response.status === 200) {
                    const creditUpdateResponse = await axios.put(`http://localhost:8000/api/users/${user.id}/update_credit/`, {
                        credit: user.credit - 10
                    }, {
                        withCredentials: true
                    });
                    message.success('Post created successfully');
                    console.log('test here');
                    console.log(creditUpdateResponse.data);
                    updateUser(creditUpdateResponse.data.user);
                    fetchPosts();
                    form.resetFields();

                    // Set up periodic data fetching every 5 seconds
                    const interval = setInterval(() => {
                        fetchPosts();
                    }, 5000);

                    // Clean up the interval on component unmount
                    return () => {
                        clearInterval(interval);
                    };
                } else {
                    message.error('Failed to create the post: Unexpected response');
                }
            } catch (error) {
                console.error('Failed to create the post', error);
                message.error('Failed to create the post: ' + (error.response?.data?.message || error.message));
            }
        } else {
            form.resetFields();
            message.error('Not enough credit');
        }


    };

    const [visibleCommentPostId, setVisibleCommentPostId] = useState(null);

    const toggleCommentsVisibility = (postId) => {
        setVisibleCommentPostId(visibleCommentPostId === postId ? null : postId);
    };

    return (
        <>
            <div>
                <Input placeholder="Input keyword to search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                />
            </div>
            <Checkbox
                checked={showMyPostsOnly}
                onChange={(e) => setShowMyPostsOnly(e.target.checked)}
            >
                Only show my posts
            </Checkbox>
            <Select defaultValue="General" style={{ width: 200 }} onChange={value => setSelectedCategory(value)}>
                {categories.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                        {option.label}
                    </Select.Option>
                ))}
            </Select>
            <ModalForm
                form={form}
                title="New Post"
                trigger={
                    <Button type="primary" icon={<PlusOutlined />} >
                        Ask a question
                    </Button>
                }
                onFinish={async (values) => {
                    createPost(values, user.id);
                    return true;
                }}
            >
                <ProFormText
                    name="title"
                    label="Title"
                    placeholder="Title"
                    rules={[{ required: true, message: 'Please input the title of the post!2' }]}
                />
                <ProFormTextArea
                    name="content"
                    label="Content"
                    placeholder="Content"
                    rules={[{ required: true, message: 'Please input the content of the post!' }]}
                />
                <ProFormSelect
                    options={categories}
                    name="category"
                    label="Category"
                    placeholder="Choose category"
                    rules={[{ required: true, message: 'Please select a category for the post!' }]}
                />
                <ProFormUploadButton
                    name="image"
                    label="Post Image"
                    title="Upload image"
                    max={1}
                    fieldProps={{
                        listType: 'picture',
                        beforeUpload: (file) => {
                            return false; // Prevent automatic upload
                        }
                    }}
                    action="/upload.do"
                    extra="Optional: Upload an image for your post."
                />
            </ModalForm>
            <ProList
                toolBarRender={() => {
                }}
                itemLayout="vertical"
                rowKey="title"
                headerTitle={<CustomHeaderTitle />}
                dataSource={filteredPosts}
                metas={{
                    title: {
                        render: (_, post) => (
                            <div>
                                <h3 style={{ color: post.status === 1 ? 'red' : 'inherit' }}>
                                    {post.title} {post.status === 1 ? '(unsolved)' : ''}
                                </h3>
                            </div>
                        ),
                    },
                    description: {

                        render: (_, post) => {
                            return (

                                <>
                                    <Tag>{post.category_name}</Tag>
                                </>
                            );

                        },
                    },
                    actions: {
                        render: (text, post) => [
                            <Button
                                type="link"
                                icon={<MessageOutlined />}
                                onClick={() => toggleCommentsVisibility(post.id)}
                            >
                                {visibleCommentPostId === post.id ? 'Hide Answers' : 'Show Answers'}
                            </Button>,
                            post.author === user.id && post.hasComments && (
                                <ModalForm
                                    title="Add Comment"

                                    form={formComment}
                                    onFinish={async (values) => {
                                        await handleAddComment({
                                            text: values.comment,
                                            post: post.id,
                                            image: values.image,
                                            author: user.id
                                        });
                                        return true;
                                    }}
                                    onCancel={() => setIsCommentModalVisible(false)}
                                    trigger={
                                        <Button type="primary" icon={<PlusOutlined />}>
                                            Answer
                                        </Button>
                                    }
                                >

                                    <ProFormTextArea
                                        name="comment"
                                        label="Comment"
                                        placeholder='Comment'
                                        rules={[{ required: true, message: 'Please input your comment!' }]}
                                    />
                                    <ProFormUploadButton
                                        title='Upload Image'
                                        name="image"
                                        label="Comment Image"
                                        max={1}
                                        fieldProps={{
                                            listType: 'picture',
                                            beforeUpload: (file) => false  // Prevent automatic upload
                                        }}
                                        extra="Optional: Upload an image for your comment."
                                    />
                                </ModalForm>),
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => openRatingModal(post.id)}
                            style={{ display: post.author === user.id ? 'inline-block' : 'none' }}>
                                Finish
                            </Button>,
                            <ModalForm
                                open={visibleRatingModal && activePostId === post.id}
                                form={ratingForm}
                                title="Rate Commenter"
                                onFinish={(values) => handleRateSubmit(values, post.comments[0].author, post.id,post.author)}
                                onOpenChange={setVisibleRatingModal}
                            >
                                <ProFormRate name="rating" label="Rating" required />
                                <ProFormText name="review" label="Review" placeholder="Write a review" />
                            </ModalForm>,


                        ],
                    },
                    extra: {
                    },
                    content: {
                        render: (content, post) => {

                            return (
                                <>
                                    {post.image && <img src={`http://localhost:8000${post.image}`} alt="Post" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />}

                                    <div style={{ height: post.isExpanded ? 'auto' : '150px', overflow: 'hidden' }}>
                                        {content}

                                    </div>

                                    {visibleCommentPostId === post.id && (
                                        <div>
                                            {post.comments && post.comments.map((comment, index) => (
                                                <div key={index} style={{ marginTop: 10, backgroundColor: '#f0f2f5', padding: '8px', borderRadius: '4px' }}>
                                                    {comment.image && (
                                                        <img src={`http://localhost:8000${comment.image}`} alt="Comment" style={{ width: '60%', maxHeight: '200px', objectFit: 'cover' }} />)}
                                                    <p>{comment.text}</p>

                                                    <small>{comment.author_name} - {new Date(comment.created_at).toLocaleString()}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </>
                            );
                        },
                    },
                }}
            />
        </>

    );
};



export default PostList;