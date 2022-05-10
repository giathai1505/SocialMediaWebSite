import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceGrinWide, faImage, faHeart, faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { Reply, InfoOutlined, FavoriteBorder, Favorite, DeleteOutline, Call } from '@material-ui/icons';
import { createMessage, getMessageInCons } from '../ChatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { checkText } from 'smile2emoji';
import { v1 as uuid } from 'uuid';
// import Peer from 'simple-peer';
// import Picker from 'emoji-picker-react';
import './Chat.scss';
import { socket } from '../pages/ChatPage';
import axios from 'axios';
import ChatSetting from './ChatSetting';
import ImagePopup from './ImagePopup';
import useImageUpload from '../../../hooks/useImageUpload';
import WarningPopup from '../../../shareComponents/WarningPopup/WarningPopup';

const ChatContent = ({ isOpenSetting, setIsOpenSetting }) => {
    const [text, setText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOpenEmojiPicker, setIsOpenEmojiPicker] = useState(false);
    const [openImagePopup, setOpenImagePopup] = useState(false);
    const conversations = useSelector((state) => state.chat.conversations);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [data, setData] = useState([]);
    const [isTymMsg, setIsTymMsg] = useState(false);
    const [srcPopup, setSrcPopup] = useState('');
    const [videoId, setVideoId] = useState(uuid());
    const [isCalling, setIsCalling] = useState(false);
    const currentUser = useSelector((state) => state.auth.current);
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const uploadImage = useImageUpload();

    const ref = useRef();
    // dummy thingssssssssssssssssssssssss


    const handleClickEmoji = () => {
        setIsOpenEmojiPicker(!isOpenEmojiPicker);
    };

    useEffect(() => {
        socket.on('recieveMessage', (mess) => {
            setData((prev) => [...prev, mess]);
            console.log(mess);
        });
        return () => {
            socket.off('recieveMessage');
            console.log('client Off');
        };
    }, [socket]);

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, [data, socket, image]);

    const getMessagesInCons = async () => {
        try {
            socket.emit('joinRoom', params.id);
            const result = await dispatch(getMessageInCons(params.id)).unwrap();
            //console.log(result.messages);
            setData(result.messages);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getMessagesInCons();
        const temp = conversations.find((conversation) => conversation._id === params.id);
        setCurrentConversation(temp);
        console.log(params.id)
        console.log(temp)
        console.log(currentConversation)

        return () => {
            console.log(params.id)
            socket.emit('leaveRoom', params.id);
        };
    }, [params.id]);

    const handleChange = (e) => {
        if (!e.target.value) {
            setIsTyping(false);
            setText('');
        } else {
            setIsTyping(true);
            e.target.value = checkText(e.target.value);
            setText(e.target.value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        try {
            const result = await dispatch(createMessage({ content: text, conversationId: params.id })).unwrap();
            console.log(result);
            console.log(currentConversation)
            socket.emit('sendMessage', result.newMessage);
            socket.emit('sendNotice', currentConversation.members);
            setText('');
            setIsTyping(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleFileChange = async (e) => {
        setUploading(true);
        setImage(window.URL.createObjectURL(e.target.files[0]));
        const url = await uploadImage(e.target.files[0]);
        const result = await dispatch(
            createMessage({ content: url, conversationId: params.id, isImage: true })
        ).unwrap();
        setUploading(false);
        console.log(result);
        socket.emit('sendMessage', result.newMessage);
        socket.emit('sendNotice', currentConversation.members);
    };

    const handleImagePopup = (src) => {
        setSrcPopup(src);
        setOpenImagePopup(true);
    };

    const handleCall = () => {
        socket.emit('IamCalling', { members: currentConversation.members, videoId });
    };

    const handleAcceptCall = (id) => {
        navigate(`/video_call/${videoId}`);
    };
    const handleDeny = () => {
        setIsCalling(false);
    };

    useEffect(() => {
        socket.on('recieveCalling', (videoId) => {
            setIsCalling(true);
            setVideoId(videoId);
        });
        return () => {
            socket.off('recieveCalling');
            console.log('End Call');
        };
    }, [socket]);

    if (isOpenSetting) {
        return <ChatSetting setIsOpenSetting={setIsOpenSetting} currentConversation={currentConversation} />;
    } else {
        return (
            <div className="rightPanel">
                <div className="rightPanel__title">
                    <div className="rightPanel__title__user">
                        <div className="rightPanel__title__user__image">
                            <img
                                src={
                                    currentConversation?.members.length === 2
                                        ? currentConversation?.members.find((item) => item._id !== currentUser._id)
                                              .avatar
                                        : 'https://res.cloudinary.com/wjbucloud/image/upload/v1651308420/j2team_girl_8_btpoep.jpg'
                                }
                                alt="unsplash"
                            />
                        </div>
                        <h6 className="rightPanel__title__user__name">
                            {currentConversation?.members.length === 2
                                ? currentConversation?.members.find((item) => item._id !== currentUser._id).name
                                : currentConversation?.members.length === 1
                                ? 'Không còn ai muốn trò chuyện với bạn nữa'
                                : currentConversation?.members
                                      .filter((item) => item._id !== currentUser._id)
                                      .map((member) => member.name)
                                      .join(', ')}
                        </h6>
                    </div>
                    <div className="rightPanel__title__call">
                        <Link target="_blank" to={`/video_call/${videoId}`}>
                            <Call cursor="pointer" onClick={handleCall} />
                        </Link>
                    </div>
                    <InfoOutlined fontSize="medium" cursor="pointer" onClick={() => setIsOpenSetting(true)} />
                </div>
                <div className="rightPanel__conversation" ref={ref}>
                    {data.map((item, index) => {
                        return (
                            <div
                                className={`rightPanel__conversation__content ${
                                    item.sender._id === currentUser._id ? 'mine' : ''
                                }`}
                                key={index}
                            >
                                {item.sender._id !== currentUser._id && (
                                    <div className="rightPanel__conversation__content__image">
                                        <img src={item.sender.avatar} alt="unsplash" />
                                    </div>
                                )}
                                {item.content.isImage === true ? (
                                    <img
                                        src={item.content.text}
                                        alt="pictureChat"
                                        className="rightPanel__conversation__content__textImage"
                                        onClick={() => handleImagePopup(item.content.text)}
                                    />
                                ) : (
                                    <p
                                        className={`rightPanel__conversation__content__text ${
                                            item.sender._id === currentUser._id ? 'mine' : ''
                                        }`}
                                    >
                                        {item.content.text}
                                    </p>
                                )}
                                {isTymMsg && (
                                    <div
                                        className={`rightPanel__conversation__content__react ${
                                            item.sender._id === currentUser._id ? 'mine' : ''
                                        }`}
                                    >
                                        <Favorite
                                            htmlColor="red"
                                            fontSize="small"
                                            className="rightPanel__conversation__content__react__tym"
                                        />
                                    </div>
                                )}

                                <div
                                    className={`rightPanel__conversation__content__options ${
                                        item.sender._id === currentUser._id ? 'mine' : ''
                                    }`}
                                >
                                    {!isTymMsg ? (
                                        <FavoriteBorder onClick={() => setIsTymMsg(true)} />
                                    ) : (
                                        <Favorite htmlColor="red" onClick={() => setIsTymMsg(false)} />
                                    )}
                                    <Reply />
                                    <DeleteOutline />
                                </div>
                            </div>
                        );
                    })}
                    {uploading && (
                        <img
                            src={image}
                            alt="collections"
                            style={{ opacity: 0.5, maxWidth: '40%', alignSelf: 'flex-end', borderRadius: '10px' }}
                        />
                    )}
                </div>
                <div className="rightPanel__inputContainer">
                    <FontAwesomeIcon
                        className="rightPanel__inputContainer__icon emoji"
                        icon={faFaceGrinWide}
                        size="lg"
                        cursor="pointer"
                    />
                    <input
                        type="text"
                        placeholder="Message..."
                        value={text}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e)}
                    />
                    {!isTyping ? (
                        <>
                            <label htmlFor="image-input" className="rightPanel__inputContainer__icon image">
                                <FontAwesomeIcon icon={faImage} size="lg" cursor="pointer" />
                            </label>
                            <input type="file" id="image-input" onChange={handleFileChange} />
                            <FontAwesomeIcon
                                className="rightPanel__inputContainer__icon heart"
                                icon={faHeart}
                                size="lg"
                                cursor="pointer"
                            />
                        </>
                    ) : (
                        <FontAwesomeIcon
                            icon={faPaperPlane}
                            size="lg"
                            cursor="pointer"
                            className="rightPanel__inputContainer__icon submit"
                            onClick={handleSubmit}
                        />
                    )}
                </div>
                {isCalling && (
                    <WarningPopup
                        title="Video Call"
                        content={`Ai đó đang muốn gọi cho bạn`}
                        handleOK={handleAcceptCall}
                        handleCANCEL={handleDeny}
                    />
                )}
                {openImagePopup && <ImagePopup src={srcPopup} setOpen={setOpenImagePopup} />}
            </div>
        );
    }
};

export default ChatContent;
