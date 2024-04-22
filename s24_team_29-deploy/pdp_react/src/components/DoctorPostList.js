import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProList } from '@ant-design/pro-components';
import {Tag, Button, message, Form, Checkbox} from 'antd';
import { MessageOutlined,PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-form';
import { useUser } from '../contexts/UserContext';
import { Typography } from 'antd';

const { Title } = Typography;

const CustomHeaderTitle = () => (
  <Title level={3} style={{ fontSize: '20px',  color: '#1890ff'  }}>
    Past consultation conversations
  </Title>
);

const DoctorPostList = () => {
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [formComment] = Form.useForm();
    const [visibleCommentPostId, setVisibleCommentPostId] = useState(null);
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const { user } = useUser();
    const [showMyCommentedPostsOnly, setShowMyCommentedPostsOnly] = useState(false);


    const fetchData = async () => {
        if (user) {
            const postsResponse = await axios.get('http://localhost:8000/api/posts/');
            const fetchedPosts = postsResponse.data.filter(post => {
                const isOnlyUserComments = post.comments.some(comment => comment.author === user.id) || post.comments.length===0;
                return (post.category_name === user.speciality || post.category_name === 'General') && isOnlyUserComments;
            });

            console.log(user.id)
            console.log('test here');
            console.log(postsResponse);
            console.log(filteredPosts);
            setPosts(filteredPosts);

            // Reverse the order of the fetched posts
            const reversedPosts = fetchedPosts.reverse();

            setPosts(reversedPosts);
            setFilteredPosts(reversedPosts);
        }
    };

    useEffect(() => {
        console.log('here');
        console.log(user);
        if (!user) {
            console.log("User data is not available yet.");
            return; // User data not loaded yet
        }

        if (user.role !== 'doctor') {
            message.error("You are not authorized to view this page.");
            return; // Exit if not a doctor
        }

        fetchData();

        // Set up data fetching every 5 seconds
        const interval = setInterval(() => {
          fetchData();
        }, 2000);

        // Clean up the interval on component unmount
        return () => {
          clearInterval(interval);
        };

    }, [user]);

    useEffect(() => {
        if (showMyCommentedPostsOnly) {
            const commentedPosts = posts.filter(post => {
                return post.comments.some(comment => comment.author === user.id);
            });
            setFilteredPosts(commentedPosts);
        } else {
            setFilteredPosts(posts);
        }
    }, [showMyCommentedPostsOnly, posts, user]);

    const toggleCommentsVisibility = postId => {
        setVisibleCommentPostId(visibleCommentPostId === postId ? null : postId);
    };

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
    const handleAddComment = async ({ text, post, image,author }) => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('post', post);
        formData.append('user', user.id);
        formData.append('user_name', user.name);
        const post1=post;
        if (image) {
            formData.append('image', image[0].originFileObj);
        }

        try {
          const postsResponse = await axios.get('http://localhost:8000/api/posts/');
            const filteredPosts = postsResponse.data.filter(post => {
                
                return (post.id===post1)
            });
            if (filteredPosts.length > 0 && filteredPosts[0].comments.length === 0){
                const cryptoUpdateResponse = await axios.put(`http://localhost:8000/api/users/${user.id}/update_credit/`, {
            credit: user.credit + 10
          }, {
            withCredentials: true
          });}
            const response = await axios.post('http://localhost:8000/api/comments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            message.success('Comment added successfully');
            formComment.resetFields();
            updatePostStatus(post, 1);
            setIsCommentModalVisible(false);
            fetchData();  // Refresh posts to include new comments
        } catch (error) {
            console.error('Failed to add the comment', error.response.data);
            message.error('Failed to add the comment');
        }
    };

    return (
        <>
            <div>
                <Checkbox
                    checked={showMyCommentedPostsOnly}
                    onChange={(e) => setShowMyCommentedPostsOnly(e.target.checked)}
                >
                    Only show my commented posts
                </Checkbox>
            </div>
            <ProList
                itemLayout="vertical"
                rowKey="id"
                headerTitle={<CustomHeaderTitle />}
                dataSource={filteredPosts}
                metas={{
                    title: {
                        render: (_, post) => (
                            <div>
                                <h3 style={{ color: post.status === 0 ? 'red' : 'inherit' }}>
                                {post.title} {post.status === 0 ? '(unsolved)' : ''}
                                </h3>
                            </div>
                        ),
                    },
                    description: {
                        render: (_, post) => <Tag>{post.category_name}</Tag>
                    },
                    actions: {
                        render: (_, post) => [
                            <Button
                                type="link"
                                icon={<MessageOutlined />}
                                onClick={() => toggleCommentsVisibility(post.id)}
                            >
                                {visibleCommentPostId === post.id ? 'Hide Comments' : 'Show Comments'}
                            </Button>,
                            <ModalForm
                                form={formComment}
                                title="Add Comment"
                                onFinish={async values => {
                                    await handleAddComment({
                                        text: values.comment,
                                        post: post.id,
                                        image: values.image
                                    });
                                    return true;
                                }}
                                trigger={
                                    <Button type="primary" icon={<PlusOutlined />}>
                                        Comment
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
                                    label="Upload Image"
                                    max={1}
                                    fieldProps={{
                                        listType: 'picture',
                                        beforeUpload: () => false
                                    }}
                                    extra="Optional: Attach an image to your comment."
                                />
                            </ModalForm>
                        ],
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

export default DoctorPostList;
