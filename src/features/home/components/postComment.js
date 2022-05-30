import React from 'react';
import { Carousel, Spinner } from 'react-bootstrap';
import IMAGES from '../../../assets/images/imageStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { HideDetailReducer } from '../homeSlice';
import AddComment from './addComment';
import {
    faCircleChevronRight,
    faCircleChevronLeft,
    faCircleXmark,
    faChessKing,
} from '@fortawesome/free-solid-svg-icons';
import PostHeader from './postHeader';
import ListComment from './ListComment';
import AlllikesPopup from './commons/allLikesPopup';
import CommentSkeleton from '../../../shareComponents/skeletonLoading/CommentSkeleton';

const PostComment = () => {
    const dispatch = useDispatch();

    const { isShowDetail, isLoadCmt, activePostId, listPosts, post } = useSelector((state) => state.home);

    let activePost = {};
    if (Object.keys(post).length === 0) {
        console.log('Lấy post trong main');
        activePost = listPosts.find((post) => post._id == activePostId);
        console.log(activePost);
    } else {
        activePost = post;
    }

    const HideDetail = () => {
        const action = HideDetailReducer();
        dispatch(action);
    };

    return (
        <div className="detail" style={{ display: isShowDetail ? '' : 'none' }}>
            <div className="detail__layout" onClick={HideDetail}></div>
            <div className="detail__content">
                <div className="detail__content__img">
                    <Carousel
                        prevIcon={<FontAwesomeIcon icon={faCircleChevronLeft} />}
                        nextIcon={<FontAwesomeIcon icon={faCircleChevronRight} />}
                    >
                        {activePost.images?.map((contentItem, index) => {
                            return (
                                <Carousel.Item key={index}>
                                    {contentItem.split('.')[contentItem.split('.').length - 1] === 'mp4' ? (
                                        <video
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }}
                                            controls
                                        >
                                            <source src={contentItem} type="video/mp4"></source>
                                        </video>
                                    ) : (
                                        <img className="d-block w-100" src={contentItem} alt="First slide" />
                                    )}
                                </Carousel.Item>
                            );
                        })}
                    </Carousel>
                </div>
                <div className="detail__content__comment">
                    <div className="detail__content__comment__header postItem__header">
                        <PostHeader postId={activePostId} postUser={activePost.user} />
                    </div>
                    <div className="detail__content__comment__body">
                        {!isLoadCmt ? <ListComment /> : <CommentSkeleton />}
                    </div>
                    <div className="detail__content__comment__footer">
                        <AddComment postId={activePostId} userPostId={activePost.user._id} />
                    </div>
                </div>
            </div>
            <div className="detail__icon" onClick={HideDetail}>
                <FontAwesomeIcon icon={faCircleXmark} />
            </div>
            <AlllikesPopup />
        </div>
    );
};

export default PostComment;
