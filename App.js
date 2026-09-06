import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  findNodeHandle,
  Easing,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Picker } from '@react-native-picker/picker';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BackHandler } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import MyTargetBanner from './components/MyTargetBanner';

// Конфигурация Supabase
const SUPABASE_URL = 'https://vlwgahvtckoipmbuekjd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd2dhaHZ0Y2tvaXBtYnVla2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODQ5ODcsImV4cCI6MjA4NTk2MDk4N30.f_KIo-t5oH2Fv7fwJRE0jmlLT0KClaOzbahVi1wNHSs';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd2dhaHZ0Y2tvaXBtYnVla2pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM4NDk4NywiZXhwIjoyMDg1OTYwOTg3fQ.tpowbTU-Y-c4CCWcHgO-6IxhRqgOo-tBP_STM_cM7yM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { width, height } = Dimensions.get('window');

// Цветовая схема
const COLORS = {
  primary: '#ffa726',
  primaryDark: '#F57C00',
  primaryLight: '#FFE0B2',
  secondary: '#FFB300',
  secondaryDark: '#FF8F00',
  accent: '#FF9800',
  background: '#FFF8E1',
  surface: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#424242',
  textLight: '#757575',
  error: '#D32F2F',
  success: '#388E3C',
  border: '#FFCC80',
  mapMarker: '#FF6D00',
  mapMarkerAlt: '#FFD54F',
  chatBubbleMe: '#FFA726',
  chatBubbleOther: '#FFE0B2',
  chatBubbleSystem: '#E0E0E0',
  androidNav: '#FFFFFF',
  moderator: '#9C27B0',
  blocked: '#616161',
  filterActive: '#F57C00',
};

const COMPANY_LOGO = 'https://1s4oyld5dc.ucarecd.net/de92523d-08cc-4096-9424-989d5aa21b0d/';

const CATEGORY_EMOJIS = {
  sport: '🏐',
  food: '🥗',
  art: '🎭',
  repair: '🛠️',
  moving: '🚚',
  garden: '🌳',
  default: '📍'
};

// Компонент меню с тремя точками
const OptionsMenu = ({ options, onSelect, style }) => {
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showMenu) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu]);

  const handleSelect = (option) => {
    setShowMenu(false);
    if (onSelect) onSelect(option);
  };

  return (
    <View style={[styles.optionsMenuContainer, style]}>
      <TouchableOpacity
        style={styles.optionsMenuButton}
        onPress={() => setShowMenu(!showMenu)}
        activeOpacity={0.7}
      >
        <Text style={styles.optionsMenuDots}>⋮</Text>
      </TouchableOpacity>

      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.optionsMenuOverlay} />
        </TouchableWithoutFeedback>
      )}

      {showMenu && (
        <Animated.View
          style={[
            styles.optionsMenuDropdown,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionsMenuItem,
                option.destructive && styles.optionsMenuItemDestructive,
                index === options.length - 1 && styles.optionsMenuItemLast,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text style={[
                styles.optionsMenuItemText,
                option.destructive && styles.optionsMenuItemTextDestructive,
              ]}>
                {option.icon ? `${option.icon} ` : ''}{option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

// Анимированная карточка с градиентом
const AnimatedGradientCard = ({ children, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      'rgba(247, 247, 247, 0.95)',
      'rgba(242, 234, 207, 0.95)',
      'rgba(255, 255, 255, 0.95)',
    ],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      'rgba(255, 215, 0, 0.3)',
      'rgba(255, 167, 38, 0.5)',
      'rgba(255, 215, 0, 0.3)',
    ],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.25, 0.1],
  });

  const shadowRadius = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [10, 20, 10],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor,
          borderColor,
          borderWidth: 1,
          shadowColor: '#FFA726',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity,
          shadowRadius,
          elevation: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [4, 12, 4],
          }),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Компонент аватара пользователя
const UserAvatar = ({ userId, size = 50, onPress }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAvatar();
    }
  }, [userId]);

  const loadAvatar = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        const { data } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(profile.avatar_url);
        if (data?.publicUrl) {
          setAvatarUrl(data.publicUrl);
        }
      }
    } catch (error) {
      console.log('Ошибка загрузки аватара:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      return profile?.username?.charAt(0).toUpperCase() || 'U';
    } catch {
      return 'U';
    }
  };

  const [initials, setInitials] = useState('U');

  useEffect(() => {
    getInitials().then(setInitials);
  }, [userId]);

  const avatarContent = loading ? (
    <ActivityIndicator size="small" color={COLORS.primary} />
  ) : avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
  ) : (
    <Text style={[styles.avatarText, { fontSize: size / 2 }]}>{initials}</Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      {avatarContent}
    </View>
  );
};

// Модальное окно просмотра профиля
const ProfileViewerModal = ({ visible, userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && userId) {
      loadProfile();
    }
  }, [visible, userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.log('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.profileViewerOverlay} />
      </TouchableWithoutFeedback>
      <View style={styles.profileViewerContainer}>
        <View style={styles.profileViewerContent}>
          <TouchableOpacity style={styles.profileViewerClose} onPress={onClose}>
            <Text style={styles.profileViewerCloseText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : profile ? (
            <>
              <View style={styles.profileViewerAvatar}>
                <UserAvatar userId={userId} size={80} />
              </View>
              <Text style={styles.profileViewerName}>
                {profile.full_name || profile.username || 'Пользователь'}
              </Text>
              <Text style={styles.profileViewerUsername}>@{profile.username}</Text>

              <View style={styles.profileViewerStats}>
                <View style={styles.profileViewerStat}>
                  <Text style={styles.profileViewerStatNumber}>{profile.rating || 5.0}</Text>
                  <Text style={styles.profileViewerStatLabel}>⭐ Рейтинг</Text>
                </View>
                <View style={styles.profileViewerStat}>
                  <Text style={styles.profileViewerStatNumber}>{profile.help_count || 0}</Text>
                  <Text style={styles.profileViewerStatLabel}>🔨 Помощь</Text>
                </View>
                <View style={styles.profileViewerStat}>
                  <Text style={styles.profileViewerStatNumber}>{profile.meetup_count || 0}</Text>
                  <Text style={styles.profileViewerStatLabel}>👥 Встречи</Text>
                </View>
              </View>

              {profile.role === 'moderator' && (
                <View style={styles.profileViewerModeratorBadge}>
                  <Text style={styles.profileViewerModeratorText}>🔰 Модератор</Text>
                </View>
              )}

              <Text style={styles.profileViewerBio}>
                {profile.bio || 'Пользователь не заполнил описание'}
              </Text>

              <View style={styles.profileViewerJoined}>
                <Text style={styles.profileViewerJoinedText}>
                  📅 Присоединился: {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.profileViewerError}>Профиль не найден</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Анимированное сообщение в чате
const AnimatedMessage = ({ message, isMyMessage, onLayout, onImagePress, onProfilePress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(isMyMessage ? 50 : -50)).current;
  const [imageUri, setImageUri] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 12,
        stiffness: 100,
      }),
    ]).start();

    if (message.image_path) {
      let publicUrl = null;
      
      const { data } = supabase
        .storage
        .from('chat_images')
        .getPublicUrl(message.image_path);
      
      if (data?.publicUrl) {
        publicUrl = data.publicUrl;
      }
      
      if (!publicUrl && message.image_path.startsWith('chat_images/')) {
        const cleanPath = message.image_path.replace('chat_images/', '');
        const { data: data2 } = supabase
          .storage
          .from('chat_images')
          .getPublicUrl(cleanPath);
        if (data2?.publicUrl) {
          publicUrl = data2.publicUrl;
        }
      }
      
      if (!publicUrl && !message.image_path.startsWith('chat_images/')) {
        const fullPath = `chat_images/${message.image_path}`;
        const { data: data3 } = supabase
          .storage
          .from('chat_images')
          .getPublicUrl(fullPath);
        if (data3?.publicUrl) {
          publicUrl = data3.publicUrl;
        }
      }
      
      if (!publicUrl) {
        const path = message.image_path.startsWith('chat_images/') 
          ? message.image_path 
          : `chat_images/${message.image_path}`;
        publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${path}`;
      }
      
      if (publicUrl) {
        setImageUri(publicUrl);
        setImageLoading(false);
      } else {
        setImageError(true);
        setImageLoading(false);
      }
    } else {
      setImageLoading(false);
    }
  }, []);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const renderMessageContent = () => {
    if (message.message_type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{message.message}</Text>
        </View>
      );
    }

    return (
      <>
        {!isMyMessage && (
          <TouchableOpacity 
            style={styles.senderNameContainer}
            onPress={() => onProfilePress && onProfilePress(message.sender_id)}
          >
            <UserAvatar userId={message.sender_id} size={24} />
            <Text style={styles.senderName}>
              {message.profiles?.username || 'Участник'}
              {message.profiles?.role === 'moderator' && (
                <Text style={styles.moderatorBadge}> 🔰</Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
        
        {message.message && (
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {message.message}
          </Text>
        )}
        
        {imageUri && !imageError ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onImagePress && onImagePress(imageUri)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.chatImage}
              resizeMode="cover"
              onError={handleImageError}
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageTapText}>👆 Нажмите для увеличения</Text>
            </View>
          </TouchableOpacity>
        ) : imageError ? (
          <View style={[styles.chatImage, styles.imageErrorContainer]}>
            <Text style={styles.imageErrorText}>❌ Не удалось загрузить фото</Text>
          </View>
        ) : imageLoading ? (
          <View style={[styles.chatImage, styles.imageLoadingContainer]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : null}
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(message.created_at)}
          </Text>
          {isMyMessage && message.read_by && message.read_by.length > 1 && (
            <Text style={styles.readByText}>👁️ {message.read_by.length - 1}</Text>
          )}
        </View>
      </>
    );
  };

  if (message.message_type === 'system') {
    return (
      <Animated.View
        style={[
          styles.systemMessageWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateX }],
          },
        ]}
        onLayout={onLayout}
      >
        {renderMessageContent()}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        isMyMessage ? styles.myMessage : styles.otherMessage,
        {
          opacity: fadeAnim,
          transform: [{ translateX }],
        },
      ]}
      onLayout={onLayout}
    >
      {renderMessageContent()}
    </Animated.View>
  );
};

// Просмотр фото
const ImageViewerModal = ({ visible, imageUri, onClose }) => {
  const [loading, setLoading] = useState(true);
  const scale = useRef(new Animated.Value(1)).current;

  const resetImage = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleDoubleTap = () => {
    Animated.spring(scale, {
      toValue: scale._value > 1 ? 1 : 2.5,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        resetImage();
        onClose();
      }}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity
          style={styles.imageViewerBackdrop}
          activeOpacity={1}
          onPress={() => {
            resetImage();
            onClose();
          }}
        />
        
        <View style={styles.imageViewerContent}>
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              style={styles.imageViewerCloseButton}
              onPress={() => {
                resetImage();
                onClose();
              }}
            >
              <Text style={styles.imageViewerCloseText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageViewerResetButton}
              onPress={resetImage}
            >
              <Text style={styles.imageViewerResetText}>⟲</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.imageViewerLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.imageViewerLoadingText}>Загрузка...</Text>
            </View>
          )}

          <TouchableWithoutFeedback onDoublePress={handleDoubleTap}>
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                styles.imageViewerImage,
                {
                  transform: [{ scale: scale }],
                },
              ]}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </TouchableWithoutFeedback>

          <View style={styles.imageViewerFooter}>
            <Text style={styles.imageViewerHint}>
              👆 Тап - закрыть • Двойной тап - увеличить
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Форматирование времени сообщения
function formatMessageTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Основной компонент приложения
export default function App() {
  const [activeTab, setActiveTab] = useState('events');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  
  // Состояния для создания и редактирования события
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('meetup');
  const [eventCategory, setEventCategory] = useState('sport');
  const [eventPrice, setEventPrice] = useState('');
  const [eventMaxParticipants, setEventMaxParticipants] = useState('5');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePath, setEventImagePath] = useState(null);
  
  // Состояния для отображения событий
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const scrollViewRef = useRef(null);
  const eventRefs = useRef({});

  // Состояния для карты
  const [showMap, setShowMap] = useState(false);
  const [mapEvents, setMapEvents] = useState([]);

  // Состояния для выбора места на карте
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 55.7558,
    longitude: 37.6173,
    address: 'Москва, центр',
  });
  const [tempLocation, setTempLocation] = useState({
    latitude: 55.7558,
    longitude: 37.6173,
    address: 'Москва, центр',
  });

  // Состояния для управления заявками
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [selectedEventApplications, setSelectedEventApplications] = useState([]);
  const [selectedEventForApplications, setSelectedEventForApplications] = useState(null);

  // Состояния для групповых чатов
  const [groupChats, setGroupChats] = useState([]);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState('');
  const [loadingGroupChats, setLoadingGroupChats] = useState(false);
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(false);
  const [sendingGroupMessage, setSendingGroupMessage] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);

  // Состояния для просмотра фото
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Состояния для просмотра профиля
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [showProfileViewer, setShowProfileViewer] = useState(false);

  // Состояния для профиля
  const [profile, setProfile] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Состояния для юридических документов
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);



const [waitingForToken, setWaitingForToken] = useState(false);

  // Состояния для модерации
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showBlockReason, setShowBlockReason] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [selectedUserToBlock, setSelectedUserToBlock] = useState(null);
  const [showDeleteReason, setShowDeleteReason] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedEventToDelete, setSelectedEventToDelete] = useState(null);

  // Состояния для жалоб
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEventToReport, setSelectedEventToReport] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');

  // Состояния для фильтров
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    date: 'all',
    distance: 0,
    searchQuery: '',
  });
  const [userLocation, setUserLocation] = useState(null);
  
  // Состояния для отслеживания клавиатуры
  const groupMessagesEndRef = useRef();
  const groupChatSubscription = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Состояния для создания чата по коду
  const [showChatByCode, setShowChatByCode] = useState(false);
  const [chatCodeInput, setChatCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [codeTimer, setCodeTimer] = useState(300);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [codeCreatorUsername, setCodeCreatorUsername] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [refreshing, setRefreshing] = useState(false);

  // Состояния для мини-карты в событии
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [miniMapEvent, setMiniMapEvent] = useState(null);
  
  // Состояния для авторизации через Яндекс
  const [yandexLoading, setYandexLoading] = useState(false);

  // Проверка активной сессии
  useEffect(() => {
    checkAuth();
    
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Загрузка данных при входе пользователя
  useEffect(() => {
    if (isSignedIn && user) {
      loadEvents();
      loadMapEvents();
      loadMyCreatedEvents();
      loadProfile();
      checkIfBlocked();
      getUserLocation();
      requestMediaPermissions();
    }
  }, [isSignedIn, user]);

  // Применение фильтров
  useEffect(() => {
    applyFilters();
  }, [events, filters, userLocation]);

  // Загрузка групповых чатов
  useEffect(() => {
    if (isSignedIn && user && activeTab === 'groupChats') {
      loadGroupChats();
    }
  }, [activeTab, isSignedIn, user]);

  // Отписка от чатов
  useEffect(() => {
    return () => {
      if (groupChatSubscription.current) {
        groupChatSubscription.current.unsubscribe();
      }
      setIsChatOpen(false);
    };
  }, []);

  // Скролл к последнему сообщению
  useEffect(() => {
    if (groupMessagesEndRef.current && selectedGroupChat) {
      setTimeout(() => {
        groupMessagesEndRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [groupMessages, selectedGroupChat]);

  // Скролл к выбранному событию
  useEffect(() => {
    if (selectedEventId && activeTab === 'events' && filteredEvents.length > 0) {
      setTimeout(() => {
        scrollToEvent(selectedEventId);
      }, 500);
    }
  }, [selectedEventId, activeTab, filteredEvents]);

  // Пробуждение базы данных
  useEffect(() => {
    const wakeUp = async () => {
      try {
        await supabase.from('events').select('id').limit(1);
        console.log('База разбужена:', new Date().toLocaleTimeString());
      } catch (e) {
        console.log('Ошибка пробуждения:', e.message);
      }
    };
    
    wakeUp();
    const interval = setInterval(wakeUp, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Обработка клавиатуры
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Обработка глубоких ссылок для Яндекс OAuth
useEffect(() => {
  const handleUrl = async (event) => {
    const url = event.url;
    console.log('🔗 Получена глубокая ссылка:', url);
    
    if (url && url.includes('famrop://auth/callback')) {
      const hash = url.split('#')[1];
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        if (accessToken) {
          console.log('✅ Токен получен из глубокой ссылки');
          // Здесь можно обработать токен, если WebBrowser не сработал
        }
      }
    }
  };
  
  const subscription = Linking.addEventListener('url', handleUrl);
  
  return () => {
    subscription.remove();
  };
}, []);

// Обработка глубоких ссылок для Яндекс
// Обработка глубоких ссылок
// Обработка глубоких ссылок
// Обработка глубоких ссылок
// Обработка глубоких ссылок - УЛУЧШЕННАЯ ВЕРСИЯ
useEffect(() => {
  const handleDeepLink = async (event) => {
    const url = event.url;
    console.log('🔗 ПОЛУЧЕНА ССЫЛКА:', url);
    
    if (url) {
      // Проверяем, содержит ли ссылка наш scheme
      if (url.includes('famrop://auth/callback')) {
        console.log('✅ Найден callback от Яндекса!');
        
        // Парсим токен
        const hashPart = url.split('#')[1];
        console.log('📦 Hash часть:', hashPart);
        
        if (hashPart) {
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          
          console.log('🔑 Токен:', accessToken ? 'ПОЛУЧЕН ✅' : 'НЕ НАЙДЕН ❌');
          
          if (accessToken) {
            // Закрываем браузер
            try {
              await WebBrowser.dismissBrowser();
              console.log('✅ Браузер закрыт');
            } catch (e) {
              console.log('Ошибка закрытия браузера:', e);
            }
            
            setWaitingForToken(false);
            setYandexLoading(true);
            await handleYandexToken(accessToken);
          }
        }
      }
    }
  };
  
  // Подписываемся на события
  const subscription = Linking.addEventListener('url', handleDeepLink);
  
  // Проверяем, не была ли ссылка получена до монтирования компонента
  const checkInitialUrl = async () => {
    try {
      const initialUrl = await Linking.getInitialURL();
      console.log('📱 Начальная ссылка:', initialUrl);
      if (initialUrl) {
        await handleDeepLink({ url: initialUrl });
      }
    } catch (error) {
      console.log('Ошибка получения начальной ссылки:', error);
    }
  };
  
  checkInitialUrl();
  
  return () => {
    subscription.remove();
    console.log('🔌 Отписка от Linking');
  };
}, []);
  // Обработка аппаратной кнопки "Назад"
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedGroupChat) {
        closeChat();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [selectedGroupChat]);
  
  // Переподключение к чату
  useEffect(() => {
    let reconnectTimer;

    if ((connectionStatus === 'disconnected' || connectionStatus === 'error') && selectedGroupChat) {
      console.log('🔄 Пытаемся переподключиться...');
      reconnectTimer = setTimeout(() => {
        if (selectedGroupChat) {
          setupRealtimeSubscription(selectedGroupChat.id);
        }
      }, 3000);
    }

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [connectionStatus, selectedGroupChat]);

  function handleDeepLink(event) {
    Alert.alert('Email подтвержден', 'Теперь вы можете войти в приложение');
  }

  // Запрос разрешений для медиа
  const requestMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('⚠️ Внимание', 'Для отправки фото нужен доступ к галерее');
    }
  };

  // Получение геолокации пользователя
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Разрешение на геолокацию не получено');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Ошибка получения геолокации:', error);
    }
  };

  // Расчет расстояния между двумя точками
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Обновление данных при pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadEvents(),
      loadMapEvents(),
      loadMyCreatedEvents(),
      loadGroupChats()
    ]);
    setRefreshing(false);
  };

  // Выбор фото для события
  const pickEventImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (!asset.base64) {
          Alert.alert('Ошибка', 'Не удалось получить данные изображения');
          return;
        }

        setLoadingProfile(true);

        const fileExt = asset.uri.split('.').pop() || 'jpg';
        const fileName = `events/${Date.now()}.${fileExt}`;
        const buffer = decode(asset.base64);

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('event_images')
          .upload(fileName, buffer, {
            contentType: asset.mimeType || 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.log('Ошибка загрузки фото события:', uploadError);
          Alert.alert('Ошибка', 'Не удалось загрузить фото');
          setLoadingProfile(false);
          return;
        }

        const { data: publicUrlData } = supabase
          .storage
          .from('event_images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          setEventImage(publicUrlData.publicUrl);
          setEventImagePath(fileName);
          Alert.alert('Успех!', 'Фото добавлено к событию');
        }
      }
    } catch (error) {
      console.log('Ошибка выбора фото:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Применение фильтров к событиям
  const applyFilters = () => {
    let filtered = [...events];

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    if (filters.date === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.starts_at);
        return eventDate >= today && eventDate < tomorrow;
      });
    } else if (filters.date === 'tomorrow') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.starts_at);
        return eventDate >= tomorrow && eventDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      });
    } else if (filters.date === 'week') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.starts_at);
        return eventDate < weekLater;
      });
    }

    if (filters.distance > 0 && userLocation) {
      filtered = filtered.filter(event => {
        if (!event.latitude || !event.longitude) return true;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          event.latitude,
          event.longitude
        );
        return distance <= filters.distance;
      });
    }

    setFilteredEvents(filtered);
  };

  // Скролл к событию
  const scrollToEvent = (eventId) => {
    if (eventRefs.current[eventId]) {
      eventRefs.current[eventId].measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
          setTimeout(() => {
            setSelectedEventId(null);
          }, 2000);
        },
        () => console.log('Ошибка измерения')
      );
    }
  };

  // Обработка нажатия на событие на карте
  const handleMapEventPress = (eventId) => {
    setShowMap(false);
    setActiveTab('events');
    setSelectedEventId(eventId);
    setTimeout(() => {
      scrollToEvent(eventId);
    }, 600);
  };

  // Получение эмодзи для события
  const getEventEmoji = (event) => {
    if (event.type === 'help') {
      return '🔨';
    }
    return CATEGORY_EMOJIS[event.category] || '👥';
  };

  // Проверка на модератора
  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';

  // Проверка на администратора чата
  const isChatAdmin = (chatId) => {
    if (!groupParticipants || !user) return false;
    const participant = groupParticipants.find(p => p.user_id === user.id && p.chat_id === chatId);
    return participant?.is_admin === true;
  };

  // Проверка сессии
  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: blockedData } = await supabase
          .from('blocked_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (blockedData) {
          await supabase.auth.signOut();
          Alert.alert('Аккаунт заблокирован', 'Ваш аккаунт был заблокирован модератором');
          return;
        }

        setIsSignedIn(true);
        setUser(session.user);
      }
    } catch (error) {
      console.log('Ошибка проверки сессии:', error);
    }
  }

  // Проверка на блокировку
  async function checkIfBlocked() {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        await supabase.auth.signOut();
        setIsSignedIn(false);
        setUser(null);
        Alert.alert('Аккаунт заблокирован', 'Ваш аккаунт был заблокирован модератором');
      }
    } catch (error) {
      console.log('Ошибка проверки блокировки:', error);
    }
  }

  // Загрузка событий
  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const currentTime = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('starts_at', currentTime)
        .eq('status', 'active')
        .order('starts_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        const mockEvents = [
          {
            id: 'demo1',
            title: '🏐 Волейбол в парке',
            description: 'Играем в волейбол, присоединяйтесь!',
            type: 'meetup',
            category: 'sport',
            price: null,
            max_participants: 10,
            current_participants: 3,
            starts_at: tomorrow.toISOString(),
            address: 'Парк Горького, Москва',
            organizer_id: 'demo',
            latitude: 55.7308,
            longitude: 37.6008,
            image_url: null,
          },
          {
            id: 'demo2',
            title: '🛋️ Помощь с переездом',
            description: 'Нужна помощь с переездом, оплата почасовая',
            type: 'help',
            category: 'moving',
            price: '5000.00',
            max_participants: 4,
            current_participants: 2,
            starts_at: dayAfterTomorrow.toISOString(),
            address: 'м. Бауманская, Москва',
            organizer_id: 'demo',
            latitude: 55.7722,
            longitude: 37.6786,
            image_url: null,
          },
          {
            id: 'demo3',
            title: '🍕 Пикник в парке',
            description: 'Берем еду и напитки, знакомимся',
            type: 'meetup',
            category: 'food',
            price: null,
            max_participants: 8,
            current_participants: 5,
            starts_at: tomorrow.toISOString(),
            address: 'Парк Сокольники, Москва',
            organizer_id: 'demo',
            latitude: 55.7983,
            longitude: 37.6764,
            image_url: null,
          },
        ];
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } else {
        setEvents(data);
        setFilteredEvents(data);
      }
    } catch (error) {
      console.log('Ошибка загрузки событий:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  // Загрузка событий для карты
  async function loadMapEvents() {
    try {
      const currentTime = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('starts_at', currentTime);
  
      if (!error && data) {
        const eventsWithCoords = data.map(event => ({
          ...event,
          latitude: event.latitude || 55.7558 + (Math.random() * 0.1 - 0.05),
          longitude: event.longitude || 37.6173 + (Math.random() * 0.1 - 0.05),
        }));
        setMapEvents(eventsWithCoords);
      } else {
        setMapEvents([]);
      }
    } catch (error) {
      console.log('Ошибка загрузки событий для карты:', error);
      setMapEvents([]);
    }
  }

  // Загрузка созданных событий пользователя
  async function loadMyCreatedEvents() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('starts_at', { ascending: true });

      if (!error && data) {
        setMyCreatedEvents(data);
      } else {
        setMyCreatedEvents([]);
      }
    } catch (error) {
      console.log('Ошибка загрузки созданных событий:', error);
      setMyCreatedEvents([]);
    }
  }

  // Загрузка заявок на событие
  async function loadApplications(eventId) {
    try {
      console.log('Загружаем заявки для события:', eventId);
      
      const { data: applications, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending');

      if (error) {
        console.log('Ошибка загрузки заявок:', error);
        setSelectedEventApplications([]);
        return;
      }

      console.log('Найдено заявок:', applications?.length || 0);

      if (!applications || applications.length === 0) {
        setSelectedEventApplications([]);
        return;
      }

      const applicationsWithProfiles = await Promise.all(
        applications.map(async (app) => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name, rating, role, avatar_url')
              .eq('id', app.user_id)
              .single();

            return {
              ...app,
              profiles: profile || {
                username: 'Пользователь',
                full_name: '',
                rating: 5.0,
                role: 'user',
                avatar_url: null
              }
            };
          } catch (err) {
            console.log('Ошибка загрузки профиля для пользователя:', app.user_id, err);
            return {
              ...app,
              profiles: {
                username: 'Пользователь',
                full_name: '',
                rating: 5.0,
                role: 'user',
                avatar_url: null
              }
            };
          }
        })
      );

      console.log('Заявки с профилями:', applicationsWithProfiles);
      setSelectedEventApplications(applicationsWithProfiles);

    } catch (error) {
      console.log('Общая ошибка загрузки заявок:', error);
      setSelectedEventApplications([]);
    }
  }

  // Загрузка профиля пользователя
  async function loadProfile() {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.log('Профиль не найден, создаем...');
        const username = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || 'user';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            full_name: '',
            bio: '',
            rating: 5.0,
            help_count: 0,
            meetup_count: 0,
            role: 'user'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
          setEditUsername(newProfile.username || '');
          setEditFullName(newProfile.full_name || '');
          setEditBio(newProfile.bio || '');
        } else {
          const minimalProfile = {
            id: user.id,
            username: username,
            full_name: '',
            bio: '',
            rating: 5.0,
            help_count: 0,
            meetup_count: 0,
            role: 'user'
          };
          setProfile(minimalProfile);
        }
      } else {
        setProfile(data);
        setEditUsername(data.username || '');
        setEditFullName(data.full_name || '');
        setEditBio(data.bio || '');
      }
    } catch (error) {
      console.log('Ошибка загрузки профиля:', error);
    } finally {
      setLoadingProfile(false);
    }
  }

  // Загрузка групповых чатов
  async function loadGroupChats() {
    if (!user) return;
    
    setLoadingGroupChats(true);
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('event_chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      if (!participants || participants.length === 0) {
        setGroupChats([]);
        return;
      }

      const chatIds = participants.map(p => p.chat_id);

      const { data: chats, error: chatsError } = await supabase
        .from('event_chats')
        .select('*')
        .in('id', chatIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      if (chats) {
        const chatsWithDetails = await Promise.all(
          chats.map(async (chat) => {
            try {
              const { data: event } = await supabase
                .from('events')
                .select('title')
                .eq('id', chat.event_id)
                .single();

              const { data: lastMessage } = await supabase
                .from('chat_messages')
                .select('message, created_at')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              const { data: messages } = await supabase
                .from('chat_messages')
                .select('id, read_by')
                .eq('chat_id', chat.id);

              let unreadCount = 0;
              if (messages) {
                unreadCount = messages.filter(msg => {
                  const readBy = msg.read_by || [];
                  return !readBy.includes(user.id);
                }).length;
              }

              const { data: participantsData } = await supabase
                .from('event_chat_participants')
                .select('id')
                .eq('chat_id', chat.id);

              return {
                ...chat,
                eventTitle: event?.title || 'Чат',
                lastMessage: lastMessage?.message || 'Чат создан',
                lastMessageTime: lastMessage?.created_at || chat.created_at,
                unreadCount,
                participantsCount: participantsData?.length || 0,
              };
            } catch (err) {
              console.log('Ошибка загрузки информации о чате:', err);
              return {
                ...chat,
                eventTitle: 'Чат',
                lastMessage: 'Чат создан',
                lastMessageTime: chat.created_at,
                unreadCount: 0,
                participantsCount: 0,
              };
            }
          })
        );

        setGroupChats(chatsWithDetails);
      } else {
        setGroupChats([]);
      }
    } catch (error) {
      console.log('Ошибка загрузки групповых чатов:', error);
      setGroupChats([]);
    } finally {
      setLoadingGroupChats(false);
    }
  }

  // Загрузка сообщений группового чата
  async function loadGroupChatMessages(chat) {
    if (!user || !chat) return;

    console.log('🔧 Загружаем чат:', chat.id);
    
    setLoadingGroupMessages(true);
    setSelectedGroupChat(chat);
    setIsChatOpen(true);
    
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      let messagesWithProfiles = [];
      if (messages && messages.length > 0) {
        messagesWithProfiles = await Promise.all(
          messages.map(async (message) => {
            try {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('username, role, avatar_url')
                .eq('id', message.sender_id)
                .single();

              return {
                ...message,
                profiles: senderProfile || { 
                  username: 'Пользователь', 
                  role: 'user',
                  avatar_url: null 
                }
              };
            } catch (err) {
              return {
                ...message,
                profiles: { username: 'Пользователь', role: 'user', avatar_url: null }
              };
            }
          })
        );

        const unreadMessages = messagesWithProfiles.filter(m => {
          const readBy = m.read_by || [];
          return !readBy.includes(user.id) && m.sender_id !== user.id;
        });
        
        for (const message of unreadMessages) {
          await markMessageAsRead(message.id);
        }
      }

      setGroupMessages(messagesWithProfiles);
      console.log('📨 Загружено сообщений:', messagesWithProfiles.length);

      const { data: participants, error: participantsError } = await supabase
        .from('event_chat_participants')
        .select('*')
        .eq('chat_id', chat.id);

      if (participantsError) throw participantsError;

      if (participants) {
        const participantsWithProfiles = await Promise.all(
          participants.map(async (participant) => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username, full_name, role, avatar_url')
                .eq('id', participant.user_id)
                .single();

              return {
                ...participant,
                profiles: profile || { 
                  username: 'Пользователь', 
                  full_name: '', 
                  role: 'user',
                  avatar_url: null 
                }
              };
            } catch (err) {
              return {
                ...participant,
                profiles: { username: 'Пользователь', full_name: '', role: 'user', avatar_url: null }
              };
            }
          })
        );

        setGroupParticipants(participantsWithProfiles);
      }

      setupRealtimeSubscription(chat.id);

    } catch (error) {
      console.log('❌ Ошибка загрузки чата:', error);
      setGroupMessages([]);
      setGroupParticipants([]);
      Alert.alert('Ошибка', 'Не удалось загрузить чат');
    } finally {
      setLoadingGroupMessages(false);
      setTimeout(() => {
        groupMessagesEndRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }

  // Закрытие чата
  const closeChat = () => {
    if (groupChatSubscription.current) {
      console.log('🔌 Отписываемся от чата');
      groupChatSubscription.current.unsubscribe();
      groupChatSubscription.current = null;
    }
    setSelectedGroupChat(null);
    setIsChatOpen(false);
    setGroupMessages([]);
    setGroupParticipants([]);
    setConnectionStatus('disconnected');
  };

  // Подписка на реальное время в чате
  function setupRealtimeSubscription(chatId) {
    if (groupChatSubscription.current) {
      console.log('🔄 Отписываемся от старого канала');
      groupChatSubscription.current.unsubscribe();
      groupChatSubscription.current = null;
    }

    console.log('📡 ПОДПИСЫВАЕМСЯ на чат:', chatId);

    const channel = supabase
      .channel(`chat_realtime_${chatId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new;
          console.log('📨 НОВОЕ СООБЩЕНИЕ (Realtime):', newMessage);
          
          if (newMessage.sender_id === user.id) {
            console.log('📨 Своё сообщение, пропускаем (уже добавлено)');
            return;
          }

          setGroupMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('📨 Сообщение уже есть в списке');
              return prev;
            }

            const tempMessage = {
              ...newMessage,
              profiles: { 
                username: 'Загрузка...', 
                role: 'user',
                avatar_url: null 
              }
            };

            console.log('📨 ДОБАВЛЯЕМ СООБЩЕНИЕ в список');

            supabase
              .from('profiles')
              .select('username, role, avatar_url')
              .eq('id', newMessage.sender_id)
              .single()
              .then(({ data: senderProfile }) => {
                if (senderProfile) {
                  setGroupMessages(current => 
                    current.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, profiles: senderProfile }
                        : msg
                    )
                  );
                }
              })
              .catch(err => {
                console.log('❌ Ошибка загрузки профиля:', err);
              });

            return [...prev, tempMessage];
          });

          markMessageAsRead(newMessage.id);

          setTimeout(() => {
            groupMessagesEndRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const updatedMessage = payload.new;
          console.log('📨 ОБНОВЛЕНИЕ СООБЩЕНИЯ:', updatedMessage);
          
          setGroupMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...msg, read_by: updatedMessage.read_by }
                : msg
            )
          );
        }
      );

    channel.subscribe((status) => {
      console.log('📡 СТАТУС ПОДПИСКИ:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ ПОДПИСКА АКТИВНА для чата:', chatId);
        setConnectionStatus('connected');
      }
      
      if (status === 'CHANNEL_ERROR') {
        console.log('❌ ОШИБКА ПОДПИСКИ');
        setConnectionStatus('error');
      }
      
      if (status === 'TIMED_OUT') {
        console.log('⏰ ТАЙМАУТ ПОДПИСКИ');
        setConnectionStatus('disconnected');
      }
    });

    groupChatSubscription.current = channel;
  }

  // Отметка сообщения как прочитанного
  async function markMessageAsRead(messageId) {
    try {
      if (!user) return;
      
      const { data: message } = await supabase
        .from('chat_messages')
        .select('read_by')
        .eq('id', messageId)
        .single();

      if (message) {
        const readBy = message.read_by || [];
        if (!readBy.includes(user.id)) {
          const updatedReadBy = [...readBy, user.id];
          await supabase
            .from('chat_messages')
            .update({ read_by: updatedReadBy })
            .eq('id', messageId);
        }
      }
    } catch (error) {
      console.log('Ошибка пометки сообщения как прочитанного:', error);
    }
  }

  // Удаление участника из чата
  async function handleRemoveParticipantFromChat(chatId, userId) {
    if (!user) return;
    if (!isChatAdmin(chatId)) {
      Alert.alert('Ошибка', 'Только администратор чата может удалять участников');
      return;
    }

    let userName = 'Участник';
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      if (userProfile) userName = userProfile.username;
    } catch (e) {}

    Alert.alert(
      'Удаление участника',
      `Вы уверены, что хотите удалить пользователя "${userName}" из чата?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('event_chat_participants')
                .delete()
                .eq('chat_id', chatId)
                .eq('user_id', userId);

              if (error) throw error;

              await supabase
                .from('chat_messages')
                .insert({
                  chat_id: chatId,
                  sender_id: user.id,
                  message: `Пользователь ${userName} был удален из чата`,
                  message_type: 'system',
                  read_by: [user.id],
                });

              setGroupParticipants(prev => prev.filter(p => p.user_id !== userId));
              
              Alert.alert('Успех', 'Участник удален из чата');
            } catch (error) {
              console.log('Ошибка удаления участника из чата:', error);
              Alert.alert('Ошибка', 'Не удалось удалить участника');
            }
          }
        }
      ]
    );
  }

  // Состояние для модального окна участников
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  // Показать участников чата
  const handleShowParticipants = () => {
    setShowParticipantsModal(true);
  };

  // Выход из чата
  async function handleLeaveChat(chatId) {
    if (!user) return;

    Alert.alert(
      'Выход из чата',
      'Вы уверены, что хотите покинуть этот чат? Вы больше не сможете получать сообщения.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('event_chat_participants')
                .delete()
                .eq('chat_id', chatId)
                .eq('user_id', user.id);

              if (error) throw error;

              await supabase
                .from('chat_messages')
                .insert({
                  chat_id: chatId,
                  sender_id: user.id,
                  message: `${profile?.username || 'Пользователь'} покинул чат`,
                  message_type: 'system',
                  read_by: [user.id],
                });

              closeChat();
              loadGroupChats();
              Alert.alert('Успех', 'Вы покинули чат');
            } catch (error) {
              console.log('Ошибка выхода из чата:', error);
              Alert.alert('Ошибка', 'Не удалось выйти из чата');
            }
          }
        }
      ]
    );
  }

  // Удаление чата
  async function handleDeleteChat(chatId) {
    if (!user) return;
    if (!isChatAdmin(chatId)) {
      Alert.alert('Ошибка', 'Только администратор чата может удалить его');
      return;
    }

    Alert.alert(
      'Удаление чата',
      'Вы уверены, что хотите удалить этот чат? Все сообщения будут удалены без возможности восстановления.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('chat_messages')
                .delete()
                .eq('chat_id', chatId);

              await supabase
                .from('event_chat_participants')
                .delete()
                .eq('chat_id', chatId);

              await supabase
                .from('event_chats')
                .delete()
                .eq('id', chatId);

              closeChat();
              loadGroupChats();
              Alert.alert('Успех', 'Чат удален');
            } catch (error) {
              console.log('Ошибка удаления чата:', error);
              Alert.alert('Ошибка', 'Не удалось удалить чат');
            }
          }
        }
      ]
    );
  }

  // Изменение аватара чата
  const handleChangeChatAvatar = async (chatId) => {
    if (!user) return;
    if (!isChatAdmin(chatId)) {
      Alert.alert('Ошибка', 'Только администратор чата может изменить аватар');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      
      if (!asset.base64) {
        Alert.alert('Ошибка', 'Не удалось получить данные изображения');
        return;
      }

      setLoadingProfile(true);

      let fileExt = 'jpg';
      if (asset.uri) {
        const parts = asset.uri.split('.');
        if (parts.length > 1) {
          fileExt = parts[parts.length - 1].toLowerCase();
        }
      }

      const fileName = `${chatId}/${Date.now()}.${fileExt}`;
      const buffer = decode(asset.base64);

      console.log('📤 Загружаем аватар чата:', fileName);

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(`chat_avatars/${fileName}`, buffer, {
          contentType: asset.mimeType || `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.log('❌ Ошибка загрузки:', uploadError);
        Alert.alert('Ошибка', `Не удалось загрузить аватар: ${uploadError.message}`);
        setLoadingProfile(false);
        return;
      }

      console.log('✅ Аватар загружен успешно');

      const { error: updateError } = await supabase
        .from('event_chats')
        .update({ 
          avatar_url: `chat_avatars/${fileName}`
        })
        .eq('id', chatId);

      if (updateError) {
        console.log('❌ Ошибка обновления чата:', updateError);
        Alert.alert('Ошибка', 'Не удалось обновить аватар чата');
        setLoadingProfile(false);
        return;
      }

      Alert.alert('Успех!', 'Аватар чата обновлен');
      
      setSelectedGroupChat(prev => prev ? { ...prev, avatar_url: `chat_avatars/${fileName}` } : null);
      await loadGroupChats();
      
    } catch (error) {
      console.log('❌ Ошибка:', error);
      Alert.alert('Ошибка', `Не удалось изменить аватар: ${error.message}`);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Показать профиль пользователя
  function handleShowUserProfile(userId) {
    setSelectedProfileUserId(userId);
    setShowProfileViewer(true);
  }

  // Загрузка аватара пользователя
  const uploadAvatar = async () => {
    if (!user) {
      Alert.alert('Ошибка', 'Вы не авторизованы');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нет доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      
      if (!asset.base64) {
        Alert.alert('Ошибка', 'Не удалось получить данные изображения');
        return;
      }

      setLoadingProfile(true);

      let fileExt = 'jpg';
      if (asset.uri) {
        const uriParts = asset.uri.split('.');
        if (uriParts.length > 1) {
          fileExt = uriParts[uriParts.length - 1].toLowerCase();
          if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
            fileExt = 'jpg';
          }
        }
      }

      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const buffer = decode(asset.base64);

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, buffer, {
          contentType: asset.mimeType || `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.log('❌ Ошибка загрузки:', uploadError);
        Alert.alert('Ошибка', `Не удалось загрузить: ${uploadError.message}`);
        setLoadingProfile(false);
        return;
      }

      console.log('✅ Аватар загружен');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: fileName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.log('❌ Ошибка обновления профиля:', updateError);
        Alert.alert('Ошибка', 'Не удалось обновить профиль');
        setLoadingProfile(false);
        return;
      }

      Alert.alert('Успех!', 'Аватар обновлен');
      await loadProfile();
      
    } catch (error) {
      console.log('❌ Ошибка:', error);
      Alert.alert('Ошибка', `Не удалось загрузить аватар: ${error.message}`);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Отправка изображения в чат
  async function sendImageMessage() {
    if (!user || !selectedGroupChat) {
      Alert.alert('Ошибка', 'Выберите чат');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSendingImage(true);

        if (!asset.base64) {
          Alert.alert('Ошибка', 'Не удалось получить данные изображения');
          setSendingImage(false);
          return;
        }

        const fileExt = asset.uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('📤 Загрузка файла:', filePath);

        const buffer = decode(asset.base64);

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('chat_images')
          .upload(filePath, buffer, {
            contentType: asset.mimeType || 'image/jpeg',
            cacheControl: '3600',
          });

        if (uploadError) {
          console.log('❌ Ошибка загрузки фото:', uploadError);
          Alert.alert('Ошибка', 'Не удалось загрузить фото');
          setSendingImage(false);
          return;
        }

        console.log('✅ Фото загружено:', uploadData);

        const messageData = {
          chat_id: selectedGroupChat.id,
          sender_id: user.id,
          message: '',
          message_type: 'image',
          image_path: filePath,
          read_by: [user.id],
          created_at: new Date().toISOString(),
        };

        console.log('📤 Сохраняем путь в БД:', filePath);

        const { data: sentMessage, error: messageError } = await supabase
          .from('chat_messages')
          .insert([messageData])
          .select()
          .single();

        if (messageError) {
          console.log('❌ Ошибка отправки сообщения:', messageError);
          Alert.alert('Ошибка', `Не удалось отправить сообщение: ${messageError.message}`);
          setSendingImage(false);
          return;
        }

        console.log('✅ Сообщение отправлено:', sentMessage);

        if (sentMessage) {
          const messageWithProfile = {
            ...sentMessage,
            profiles: { username: profile?.username || 'Вы', role: profile?.role || 'user' }
          };
          setGroupMessages(prev => [...prev, messageWithProfile]);
          setTimeout(() => {
            groupMessagesEndRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }

        setSendingImage(false);
      } else {
        setSendingImage(false);
      }
    } catch (error) {
      console.log('❌ Ошибка отправки фото:', error);
      Alert.alert('Ошибка', `Не удалось отправить фото: ${error.message || 'Попробуйте позже'}`);
      setSendingImage(false);
    }
  }

  // Отправка текстового сообщения в чат
  async function sendGroupMessage() {
    if (!user || !selectedGroupChat) return;

    const messageText = newGroupMessage.trim();

    if (!messageText) {
      Alert.alert('Внимание', 'Напишите сообщение');
      return;
    }

    setNewGroupMessage('');
    setSendingGroupMessage(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      chat_id: selectedGroupChat.id,
      sender_id: user.id,
      message: messageText,
      message_type: 'text',
      read_by: [user.id],
      created_at: new Date().toISOString(),
      profiles: { 
        username: profile?.username || 'Вы', 
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url || null
      },
      isTemp: true
    };

    setGroupMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      groupMessagesEndRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: selectedGroupChat.id,
          sender_id: user.id,
          message: messageText,
          message_type: 'text',
          read_by: [user.id],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGroupMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { 
                  ...data, 
                  profiles: { 
                    username: profile?.username || 'Вы', 
                    role: profile?.role || 'user',
                    avatar_url: profile?.avatar_url || null
                  } 
                }
              : msg
          )
        );
      }
      
    } catch (error) {
      console.log('❌ Ошибка отправки сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      setGroupMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewGroupMessage(messageText);
    } finally {
      setSendingGroupMessage(false);
    }
  }

  // Обновление профиля
  async function updateProfile() {
    if (!user || !profile) return;

    setLoadingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUsername.trim(),
          full_name: editFullName.trim(),
          bio: editBio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        username: editUsername.trim(),
        full_name: editFullName.trim(),
        bio: editBio.trim(),
      }));

      setShowProfileEdit(false);
      Alert.alert('Успех!', 'Профиль обновлен');
    } catch (error) {
      console.log('Ошибка обновления профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setLoadingProfile(false);
    }
  }

  // Обработка нажатия на карте
  function handleMapPress(event) {
    const { coordinate } = event.nativeEvent;
    setTempLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: `📍 ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
    });
  }

  // Авторизация через Яндекс
  // Авторизация через Яндекс
// Авторизация через Яндекс
// Авторизация через Яндекс
const handleYandexAuth = async () => {
  setYandexLoading(true);
  setWaitingForToken(true);
  
  console.log('🔑 Начинаем авторизацию через Яндекс...');
  
  // Таймаут для обработки
  const timeoutId = setTimeout(() => {
    if (waitingForToken) {
      console.log('⏰ Таймаут авторизации');
      setYandexLoading(false);
      setWaitingForToken(false);
      Alert.alert(
        '⏰ Время вышло',
        'Приложение не получило ответ от Яндекса. Попробуйте еще раз.',
        [{ text: 'OK' }]
      );
    }
  }, 60000); // 60 секунд
  
  try {
    const CLIENT_ID = '4c8d2061934f423297631f950f739ccf';
    const redirectUri = 'https://asaassaas.github.io/famrop-auth';
    
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&display=popup`;
    
    console.log('🌐 URL авторизации:', authUrl);
    console.log('📱 Ожидаем возврат на:', 'famrop://auth/callback');
    
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
      showInRecents: true,
      preferEphemeralSession: false,
      createTask: true,
    });
    
    console.log('📱 Результат WebBrowser:', JSON.stringify(result));
    
    clearTimeout(timeoutId);
    
    // Если WebBrowser вернул результат
    if (result.type === 'success' && result.url) {
      console.log('✅ WebBrowser вернул URL:', result.url);
      await handleDeepLinkFromWebBrowser(result.url);
    } else if (result.type === 'cancel') {
      console.log('❌ Отменено пользователем');
      setYandexLoading(false);
      setWaitingForToken(false);
    } else {
      console.log('📱 Результат:', result.type);
      // Ждем Linking
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Ошибка:', error);
    setYandexLoading(false);
    setWaitingForToken(false);
    Alert.alert('Ошибка', `Не удалось войти через Яндекс: ${error.message}`);
  }
};

// Функция для обработки ссылки из WebBrowser
const handleDeepLinkFromWebBrowser = async (url) => {
  console.log('🔗 Обработка URL из WebBrowser:', url);
  
  if (url.includes('famrop://auth/callback')) {
    const hashPart = url.split('#')[1];
    if (hashPart) {
      const params = new URLSearchParams(hashPart);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        console.log('✅ Токен получен из WebBrowser');
        setWaitingForToken(false);
        await WebBrowser.dismissBrowser();
        await handleYandexToken(accessToken);
      }
    }
  }
};

// Отдельная функция для обработки токена
// Обработка токена после авторизации
const handleYandexToken = async (accessToken) => {
  try {
    console.log('🔄 Получаем информацию о пользователе...');
    
    const userInfoResponse = await fetch('https://login.yandex.ru/info', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error(`Ошибка API: ${userInfoResponse.status}`);
    }
    
    const userInfo = await userInfoResponse.json();
    console.log('👤 Пользователь:', userInfo);
    
    if (!userInfo.id) {
      throw new Error('Не удалось получить ID');
    }
    
    const email = userInfo.default_email || userInfo.emails?.[0] || `${userInfo.id}@yandex.ru`;
    const displayName = userInfo.display_name || userInfo.login || 'Пользователь';
    const login = userInfo.login || displayName;
    
    console.log('📧 Email:', email);
    
    // Пробуем войти
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: `yandex_${userInfo.id}`
    });
    
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('📝 Регистрируем пользователя без подтверждения почты...');
      
      // ИСПОЛЬЗУЕМ admin API для создания пользователя без подтверждения
      // Для этого нужен service_role ключ
      const supabaseAdmin = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
      );
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: `yandex_${userInfo.id}`,
        email_confirm: true, // ВАЖНО: подтверждаем почту сразу
        user_metadata: {
          username: login,
          full_name: displayName,
        }
      });
      
      if (createError) {
        console.log('❌ Ошибка создания через admin:', createError);
        // Если admin не работает - пробуем обычный signUp с autoConfirm
        throw createError;
      }
      
      console.log('✅ Пользователь создан через admin:', newUser.user?.id);
      
      // Создаем профиль
      if (newUser.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            username: login,
            full_name: displayName,
            rating: 5.0,
            help_count: 0,
            meetup_count: 0,
            role: 'user'
          }, { onConflict: 'id' });
        
        if (profileError) {
          console.log('⚠️ Ошибка профиля:', profileError);
        }
      }
      
      // Входим
      const { data: signInRetry, error: signInRetryError } = await supabase.auth.signInWithPassword({
        email: email,
        password: `yandex_${userInfo.id}`
      });
      
      if (signInRetryError) throw signInRetryError;
      
      if (signInRetry.user) {
        console.log('✅ Вход выполнен!');
        setIsSignedIn(true);
        setUser(signInRetry.user);
        await loadProfile();
        Alert.alert('✅ Успех!', 'Вы вошли через Яндекс!');
        await WebBrowser.dismissBrowser();
      }
      
    } else if (signInData?.user) {
      console.log('✅ Вход выполнен!');
      setIsSignedIn(true);
      setUser(signInData.user);
      await loadProfile();
      Alert.alert('✅ Успех!', 'Вы вошли через Яндекс!');
      await WebBrowser.dismissBrowser();
      
    } else if (signInError) {
      throw signInError;
    } else {
      throw new Error('Не удалось выполнить вход');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    Alert.alert('Ошибка', error.message || 'Не удалось войти');
    setYandexLoading(false);
  } finally {
    setYandexLoading(false);
  }
};
  // Стандартная авторизация (email/пароль)
  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните email и пароль');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          options: {
            emailRedirectTo: 'famrop://confirm',
            data: {
              username: email.split('@')[0]
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          Alert.alert(
            '✅ Регистрация почти завершена!',
            `На email ${email} отправлено письмо с подтверждением.\n\nПожалуйста, перейдите по ссылке в письме, чтобы активировать аккаунт.`,
            [
              {
                text: 'Понятно',
                onPress: () => {
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                }
              }
            ]
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            Alert.alert(
              '❌ Email не подтвержден',
              'Пожалуйста, подтвердите ваш email, перейдя по ссылке в письме, которое мы отправили при регистрации.\n\nНе пришло письмо? Нажмите "Отправить снова"',
              [
                { text: 'Отмена' },
                {
                  text: 'Отправить снова',
                  onPress: async () => {
                    await supabase.auth.resend({
                      type: 'signup',
                      email: email.trim().toLowerCase(),
                    });
                    Alert.alert('✅ Письмо отправлено', 'Проверьте почту');
                  }
                }
              ]
            );
            return;
          }
          throw error;
        }
        
        const { data: blockedData } = await supabase
          .from('blocked_users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (blockedData) {
          await supabase.auth.signOut();
          Alert.alert('Аккаунт заблокирован', 'Ваш аккаунт был заблокирован модератором');
          return;
        }

        setIsSignedIn(true);
        setUser(data.user);
      }
    } catch (error) {
      console.log('Auth error:', error);
      Alert.alert('Ошибка', error.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  }

  // Генерация кода для чата
  function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Создание кода для чата
  async function handleGenerateChatCode() {
    if (!user) {
      Alert.alert('Ошибка', 'Вы не авторизованы');
      return;
    }

    setIsGeneratingCode(true);

    try {
      const code = generateRandomCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const { data, error } = await supabase
        .from('chat_codes')
        .insert({
          code: code,
          creator_id: user.id,
          expires_at: expiresAt.toISOString(),
          is_used: false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const newCode = generateRandomCode();
          const { data: retryData, error: retryError } = await supabase
            .from('chat_codes')
            .insert({
              code: newCode,
              creator_id: user.id,
              expires_at: expiresAt.toISOString(),
              is_used: false,
            })
            .select()
            .single();
            
          if (retryError) throw retryError;
          
          setGeneratedCode(retryData.code);
          setCodeExpiresAt(expiresAt);
          setIsCodeValid(true);
          setCodeTimer(300);
          setCodeCreatorUsername(profile?.username || 'Пользователь');
          
          const timer = setInterval(() => {
            setCodeTimer(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                setIsCodeValid(false);
                setGeneratedCode('');
                Alert.alert('⏰ Код истек', 'Время действия кода истекло. Создайте новый.');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          Alert.alert(
            '✅ Код создан!',
            `Код для подключения: ${retryData.code}\n\nПокажите код другому пользователю.\nКод действителен 5 минут.`,
            [{ text: 'OK' }]
          );
          setIsGeneratingCode(false);
          return;
        }
        throw error;
      }

      setGeneratedCode(data.code);
      setCodeExpiresAt(expiresAt);
      setIsCodeValid(true);
      setCodeTimer(300);
      setCodeCreatorUsername(profile?.username || 'Пользователь');

      const timer = setInterval(() => {
        setCodeTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCodeValid(false);
            setGeneratedCode('');
            Alert.alert('⏰ Код истек', 'Время действия кода истекло. Создайте новый.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert(
        '✅ Код создан!',
        `Код для подключения: ${data.code}\n\nПокажите код другому пользователю.\nКод действителен 5 минут.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.log('Ошибка создания кода:', error);
      Alert.alert('Ошибка', 'Не удалось создать код. Попробуйте позже.');
    } finally {
      setIsGeneratingCode(false);
    }
  }

  // Подключение к чату по коду
  async function handleJoinChatByCode() {
    if (!user) {
      Alert.alert('Ошибка', 'Вы не авторизованы');
      return;
    }

    const enteredCode = chatCodeInput.trim();

    if (!enteredCode || enteredCode.length !== 6) {
      Alert.alert('Ошибка', 'Введите корректный 6-значный код');
      return;
    }

    if (!/^\d{6}$/.test(enteredCode)) {
      Alert.alert('Ошибка', 'Код должен содержать только цифры');
      return;
    }

    setJoiningByCode(true);

    try {
      const { data: codeData, error: codeError } = await supabase
        .from('chat_codes')
        .select('*')
        .eq('code', enteredCode)
        .single();

      if (codeError) {
        if (codeError.code === 'PGRST116') {
          Alert.alert('❌ Код не найден', `Код "${enteredCode}" не существует. Проверьте правильность ввода.`);
        } else {
          throw codeError;
        }
        setJoiningByCode(false);
        return;
      }

      if (codeData.is_used) {
        Alert.alert('❌ Код уже использован', 'Этот код уже был использован. Попросите создать новый код.');
        setJoiningByCode(false);
        return;
      }

      const expiresAt = new Date(codeData.expires_at);
      const now = new Date();

      if (expiresAt.getTime() < now.getTime()) {
        Alert.alert('⏰ Код истек', 'Время действия кода истекло. Попросите создать новый код.');
        await supabase
          .from('chat_codes')
          .update({ is_used: true })
          .eq('id', codeData.id);
        setJoiningByCode(false);
        return;
      }

      if (codeData.creator_id === user.id) {
        Alert.alert('❌ Ошибка', 'Вы не можете подключиться к своему собственному коду');
        setJoiningByCode(false);
        return;
      }

      const { data: creatorProfile, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', codeData.creator_id)
        .single();

      if (creatorError) throw creatorError;

      const { data: existingParticipants, error: participantsError } = await supabase
        .from('event_chat_participants')
        .select('chat_id')
        .in('user_id', [user.id, codeData.creator_id]);

      if (participantsError) throw participantsError;

      const userChats = existingParticipants
        .filter(p => p.user_id === user.id)
        .map(p => p.chat_id);
      const creatorChats = existingParticipants
        .filter(p => p.user_id === codeData.creator_id)
        .map(p => p.chat_id);

      const commonChats = userChats.filter(id => creatorChats.includes(id));

      if (commonChats.length > 0) {
        const { data: chatData } = await supabase
          .from('event_chats')
          .select('*')
          .eq('id', commonChats[0])
          .single();

        if (chatData) {
          await supabase
            .from('chat_codes')
            .update({ is_used: true })
            .eq('id', codeData.id);

          const chatWithTitle = {
            ...chatData,
            eventTitle: chatData.title || `Чат с ${creatorProfile.username}`
          };
          await loadGroupChatMessages(chatWithTitle);
          setShowChatByCode(false);
          setChatCodeInput('');
          setJoiningByCode(false);
          setActiveTab('groupChats');
          Alert.alert('✅ Чат уже существует', 'Вы подключились к существующему чату');
          return;
        }
      }

      const chatTitle = `Чат с ${creatorProfile.username}`;
      const expiresAtChat = new Date();
      expiresAtChat.setDate(expiresAtChat.getDate() + 30);

      const { data: newChat, error: chatError } = await supabase
        .from('event_chats')
        .insert({
          event_id: null,
          title: chatTitle,
          expires_at: expiresAtChat.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (chatError) {
        if (chatError.message && chatError.message.includes('null value in column "event_id"')) {
          const { data: dummyEvent, error: eventError } = await supabase
            .from('events')
            .insert({
              organizer_id: codeData.creator_id,
              title: `Приватный чат с ${creatorProfile.username}`,
              description: `Приватный чат`,
              type: 'meetup',
              category: 'sport',
              address: 'Приватный чат',
              latitude: 55.7558,
              longitude: 37.6173,
              starts_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              max_participants: 2,
              current_participants: 0,
              is_paid: false,
              price: null,
              status: 'active',
            })
            .select()
            .single();

          if (eventError) throw eventError;

          const { data: chatWithEvent, error: retryError } = await supabase
            .from('event_chats')
            .insert({
              event_id: dummyEvent.id,
              title: chatTitle,
              expires_at: expiresAtChat.toISOString(),
              is_active: true,
            })
            .select()
            .single();

          if (retryError) throw retryError;
          
          await supabase
            .from('event_chat_participants')
            .insert([
              { chat_id: chatWithEvent.id, user_id: codeData.creator_id, is_admin: true },
              { chat_id: chatWithEvent.id, user_id: user.id, is_admin: false },
            ]);

          await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatWithEvent.id,
              sender_id: codeData.creator_id,
              message: `Привет! ${creatorProfile.username} создал(а) этот чат через код. Добро пожаловать!`,
              message_type: 'system',
              read_by: [codeData.creator_id],
            });

          await supabase
            .from('chat_codes')
            .update({ is_used: true })
            .eq('id', codeData.id);

          Alert.alert('✅ Успех!', `Вы подключились к чату с ${creatorProfile.username}!`);
          
          setShowChatByCode(false);
          setChatCodeInput('');
          setJoiningByCode(false);

          await loadGroupChats();
          const chatWithTitle = {
            ...chatWithEvent,
            eventTitle: chatWithEvent.title
          };
          await loadGroupChatMessages(chatWithTitle);
          setActiveTab('groupChats');
          setJoiningByCode(false);
          return;
        }
        throw chatError;
      }

      await supabase
        .from('event_chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: codeData.creator_id, is_admin: true },
          { chat_id: newChat.id, user_id: user.id, is_admin: false },
        ]);

      await supabase
        .from('chat_messages')
        .insert({
          chat_id: newChat.id,
          sender_id: codeData.creator_id,
          message: `Привет! ${creatorProfile.username} создал(а) этот чат через код. Добро пожаловать!`,
          message_type: 'system',
          read_by: [codeData.creator_id],
        });

      await supabase
        .from('chat_codes')
        .update({ is_used: true })
        .eq('id', codeData.id);

      Alert.alert('✅ Успех!', `Вы подключились к чату с ${creatorProfile.username}!`);
      
      setShowChatByCode(false);
      setChatCodeInput('');
      setJoiningByCode(false);

      await loadGroupChats();
      const chatWithTitle = {
        ...newChat,
        eventTitle: newChat.title
      };
      await loadGroupChatMessages(chatWithTitle);
      setActiveTab('groupChats');

    } catch (error) {
      console.log('Ошибка подключения по коду:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к чату. Попробуйте позже.');
      setJoiningByCode(false);
    }
  }

  // Открытие модального окна редактирования события
  const openEditModal = (event) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventType(event.type);
    setEventCategory(event.category || 'sport');
    setEventPrice(event.price ? String(event.price) : '');
    setEventMaxParticipants(String(event.max_participants));
    setEventImagePath(event.image_url || null);
    if (event.image_url) {
      const { data } = supabase
        .storage
        .from('event_images')
        .getPublicUrl(event.image_url);
      if (data?.publicUrl) {
        setEventImage(data.publicUrl);
      }
    } else {
      setEventImage(null);
    }
    
    const date = new Date(event.starts_at);
    setEventDate(date);
    setEventTime(date);
    
    setSelectedLocation({
      latitude: event.latitude || 55.7558,
      longitude: event.longitude || 37.6173,
      address: event.address || 'Москва, центр',
    });
    
    setShowEditModal(true);
  };

  // Обновление события
  async function handleUpdateEvent() {
    if (!eventTitle.trim()) {
      Alert.alert('Ошибка', 'Введите название события');
      return;
    }

    try {
      const dateTime = new Date(eventDate);
      dateTime.setHours(eventTime.getHours());
      dateTime.setMinutes(eventTime.getMinutes());
      
      const now = new Date();
      
      if (dateTime <= now) {
        Alert.alert('Ошибка', 'Дата и время события должны быть в будущем');
        return;
      }

      const eventData = {
        title: eventTitle,
        description: eventDescription,
        type: eventType,
        category: eventCategory,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        starts_at: dateTime.toISOString(),
        max_participants: parseInt(eventMaxParticipants),
        is_paid: eventType === 'help' && eventPrice !== '',
        price: eventType === 'help' && eventPrice ? parseFloat(eventPrice) : null,
        updated_at: new Date().toISOString(),
        image_url: eventImagePath || null,
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)
        .eq('organizer_id', user.id);

      if (error) throw error;

      Alert.alert('Успех! ✅', 'Событие обновлено!');
      setShowEditModal(false);
      resetEventForm();
      setEditingEvent(null);
      loadEvents();
      loadMapEvents();
      loadMyCreatedEvents();
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось обновить событие');
      console.error('Update event error:', error);
    }
  }

  // Создание события
  async function handleCreateEvent() {
    if (!eventTitle.trim()) {
      Alert.alert('Ошибка', 'Введите название события');
      return;
    }

    const participantsCount = parseInt(eventMaxParticipants);
    if (participantsCount > 20) {
      Alert.alert('Ограничение', 'Максимальное количество участников - 20 человек');
      return;
    }
    
    if (participantsCount < 1) {
      Alert.alert('Ошибка', 'Минимальное количество участников - 1');
      return;
    }

    try {
      const dateTime = new Date(eventDate);
      dateTime.setHours(eventTime.getHours());
      dateTime.setMinutes(eventTime.getMinutes());
      
      const now = new Date();
      
      if (dateTime <= now) {
        Alert.alert('Ошибка', 'Дата и время события должны быть в будущем');
        return;
      }

      const eventData = {
        organizer_id: user.id,
        title: eventTitle,
        description: eventDescription,
        type: eventType,
        category: eventCategory,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        starts_at: dateTime.toISOString(),
        max_participants: parseInt(eventMaxParticipants),
        current_participants: 0,
        is_paid: eventType === 'help' && eventPrice !== '',
        price: eventType === 'help' && eventPrice ? parseFloat(eventPrice) : null,
        price_negotiable: false,
        status: 'active',
        image_url: eventImagePath || null,
      };

      const { data: createdEvent, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      if (createdEvent) {
        const expiresAt = new Date(dateTime.getTime() + 24 * 60 * 60 * 1000);
        
        const { data: createdChat, error: chatError } = await supabase
          .from('event_chats')
          .insert([{
            event_id: createdEvent.id,
            title: `Чат события: ${eventTitle}`,
            expires_at: expiresAt.toISOString(),
            is_active: true,
          }])
          .select()
          .single();

        if (chatError) throw chatError;

        if (createdChat) {
          await supabase
            .from('event_chat_participants')
            .insert([{
              chat_id: createdChat.id,
              user_id: user.id,
              is_admin: true,
            }]);

          await supabase
            .from('chat_messages')
            .insert([{
              chat_id: createdChat.id,
              sender_id: user.id,
              message: `Чат события "${eventTitle}" создан!`,
              message_type: 'system',
              read_by: [user.id],
            }]);
        }
      }

      Alert.alert('Успех! ✅', 'Событие создано! Групповой чат создан автоматически.');
      setShowCreateModal(false);
      resetEventForm();
      loadEvents();
      loadMapEvents();
      loadMyCreatedEvents();
      loadGroupChats();
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать событие');
      console.error('Create event error:', error);
    }
  }

  // Удаление события
  async function handleDeleteMyEvent(eventId) {
    Alert.alert(
      'Удаление события',
      'Вы уверены, что хотите удалить это событие? Все заявки и чат будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: chat } = await supabase
                .from('event_chats')
                .select('id')
                .eq('event_id', eventId)
                .single();

              if (chat) {
                await supabase
                  .from('chat_messages')
                  .delete()
                  .eq('chat_id', chat.id);

                await supabase
                  .from('event_chat_participants')
                  .delete()
                  .eq('chat_id', chat.id);

                await supabase
                  .from('event_chats')
                  .delete()
                  .eq('id', chat.id);
              }

              await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', eventId);

              await supabase
                .from('events')
                .delete()
                .eq('id', eventId)
                .eq('organizer_id', user.id);

              Alert.alert('Успех', 'Событие удалено');
              loadEvents();
              loadMapEvents();
              loadMyCreatedEvents();
              loadGroupChats();
            } catch (error) {
              console.log('Ошибка удаления события:', error);
              Alert.alert('Ошибка', 'Не удалось удалить событие');
            }
          }
        }
      ]
    );
  }

  // Присоединение к событию
  async function handleJoinEvent(eventId) {
    if (!user) return;
    
    try {
      const { data: existingApplication } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingApplication) {
        Alert.alert('Внимание', 'Вы уже подали заявку на это событие');
        return;
      }

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert('Успех!', 'Заявка на участие отправлена!');
      loadEvents();
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Не удалось присоединиться');
    }
  }

  // Удаление участника
  async function handleRemoveParticipant(eventId, userId, applicationId) {
    Alert.alert(
      'Удаление участника',
      'Вы уверены, что хотите удалить этого участника из события? Он будет удален из группового чата.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: deleteError } = await supabase
                .from('event_participants')
                .delete()
                .eq('id', applicationId);

              if (deleteError) throw deleteError;

              await supabase
                .from('events')
                .update({ 
                  current_participants: (selectedEventForApplications.current_participants || 0) - 1 
                })
                .eq('id', eventId);

              const { data: chat } = await supabase
                .from('event_chats')
                .select('id')
                .eq('event_id', eventId)
                .single();

              if (chat) {
                await supabase
                  .from('event_chat_participants')
                  .delete()
                  .eq('chat_id', chat.id)
                  .eq('user_id', userId);

                const { data: userProfile } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', userId)
                  .single();

                await supabase
                  .from('chat_messages')
                  .insert([{
                    chat_id: chat.id,
                    sender_id: user.id,
                    message: `Пользователь ${userProfile?.username || 'Участник'} был удален из события`,
                    message_type: 'system',
                    read_by: [user.id],
                  }]);
              }

              Alert.alert('Успех', 'Участник удален из события и чата');
              await loadApplications(eventId);
              await loadEvents();
              await loadMyCreatedEvents();
              await loadGroupChats();
            } catch (error) {
              console.log('Ошибка удаления участника:', error);
              Alert.alert('Ошибка', 'Не удалось удалить участника');
            }
          }
        }
      ]
    );
  }

  // Принятие заявки
  async function handleAcceptApplication(applicationId, userId) {
    try {
      console.log('Принимаем заявку:', applicationId, 'пользователь:', userId);
      
      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) throw error;

      await supabase
        .from('events')
        .update({ 
          current_participants: (selectedEventForApplications.current_participants || 0) + 1 
        })
        .eq('id', selectedEventForApplications.id);

      const { data: chat } = await supabase
        .from('event_chats')
        .select('id')
        .eq('event_id', selectedEventForApplications.id)
        .single();

      if (chat) {
        await supabase
          .from('event_chat_participants')
          .insert([{
            chat_id: chat.id,
            user_id: userId,
            is_admin: false,
          }]);

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();

        await supabase
          .from('chat_messages')
          .insert([{
            chat_id: chat.id,
            sender_id: userId,
            message: `Пользователь ${userProfile?.username || 'Новый участник'} присоединился к событию`,
            message_type: 'system',
            read_by: [],
          }]);
      }

      await loadApplications(selectedEventForApplications.id);
      await loadEvents();
      await loadMyCreatedEvents();
      await loadGroupChats();
      
      Alert.alert('Успех!', 'Заявка принята, пользователь добавлен в групповой чат');
    } catch (error) {
      console.log('Ошибка принятия заявки:', error);
      Alert.alert('Ошибка', 'Не удалось принять заявку');
    }
  }

  // Отклонение заявки
  async function handleRejectApplication(applicationId) {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      await loadApplications(selectedEventForApplications.id);
      Alert.alert('Успех!', 'Заявка отклонена');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отклонить заявку');
    }
  }

  // Удаление события модератором
  async function handleModeratorDeleteEvent(eventId, reason = 'Нарушение правил') {
    if (!isModerator) {
      Alert.alert('Ошибка', 'У вас нет прав модератора');
      return;
    }

    try {
      await supabase
        .from('moderated_events')
        .insert({
          event_id: eventId,
          moderator_id: user.id,
          reason: reason,
          action: 'deleted'
        });

      const { data: chat } = await supabase
        .from('event_chats')
        .select('id')
        .eq('event_id', eventId)
        .single();

      if (chat) {
        await supabase
          .from('chat_messages')
          .delete()
          .eq('chat_id', chat.id);

        await supabase
          .from('event_chat_participants')
          .delete()
          .eq('chat_id', chat.id);

        await supabase
          .from('event_chats')
          .delete()
          .eq('id', chat.id);
      }

      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId);

      await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      Alert.alert('Успех', 'Событие удалено');
      
      if (showDeleteReason) {
        setShowDeleteReason(false);
        setSelectedEventToDelete(null);
        setDeleteReason('');
      }
      
      loadEvents();
      loadMapEvents();
      loadMyCreatedEvents();
      loadGroupChats();
    } catch (error) {
      console.log('Ошибка удаления события:', error);
      Alert.alert('Ошибка', 'Не удалось удалить событие');
    }
  }

  // Блокировка пользователя
  async function handleBlockUser(userId, reason = 'Нарушение правил') {
    if (!isModerator) {
      Alert.alert('Ошибка', 'У вас нет прав модератора');
      return;
    }

    try {
      await supabase
        .from('blocked_users')
        .insert({
          user_id: userId,
          moderator_id: user.id,
          reason: reason
        });

      const { data: userEvents } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', userId);

      if (userEvents) {
        for (const event of userEvents) {
          await handleModeratorDeleteEvent(event.id, 'Пользователь заблокирован');
        }
      }

      Alert.alert('Успех', 'Пользователь заблокирован');
      
      if (showBlockReason) {
        setShowBlockReason(false);
        setSelectedUserToBlock(null);
        setBlockReason('');
      }
    } catch (error) {
      console.log('Ошибка блокировки пользователя:', error);
      Alert.alert('Ошибка', 'Не удалось заблокировать пользователя');
    }
  }

  // Отправка жалобы
  async function handleReportEvent() {
    if (!user) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться');
      return;
    }
    
    if (!selectedEventToReport) {
      Alert.alert('Ошибка', 'Событие не выбрано');
      return;
    }
    
    if (!reportReason) {
      Alert.alert('Ошибка', 'Выберите причину жалобы');
      return;
    }

    try {
      console.log('Отправляем жалобу:', {
        event_id: selectedEventToReport,
        reporter_id: user.id,
        reason: reportReason,
        comment: reportComment
      });

      const { data, error } = await supabase
        .from('event_reports')
        .insert([{
          event_id: selectedEventToReport,
          reporter_id: user.id,
          reason: reportReason,
          comment: reportComment || '',
          status: 'pending'
        }])
        .select();

      if (error) {
        console.log('Детали ошибки:', error);
        
        if (error.code === '23503') {
          Alert.alert('Ошибка', 'Событие не найдено или было удалено');
        } else if (error.code === '42501') {
          Alert.alert('Ошибка прав доступа', 'У вас нет прав для отправки жалобы');
        } else if (error.message) {
          Alert.alert('Ошибка', error.message);
        } else {
          throw error;
        }
        return;
      }

      console.log('Жалоба отправлена успешно:', data);

      Alert.alert(
        '✅ Жалоба отправлена',
        'Спасибо! Модераторы рассмотрят вашу жалобу в ближайшее время.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowReportModal(false);
              setSelectedEventToReport(null);
              setReportReason('');
              setReportComment('');
            }
          }
        ]
      );

    } catch (error) {
      console.log('Полная ошибка отправки жалобы:', error);
      
      if (error.message && error.message.includes('network')) {
        Alert.alert('Ошибка сети', 'Проверьте подключение к интернету');
      } else if (error.code === '42P01') {
        Alert.alert(
          'Ошибка базы данных',
          'Таблица для жалоб не создана. Пожалуйста, сообщите администратору.'
        );
      } else {
        Alert.alert(
          'Ошибка',
          'Не удалось отправить жалобу. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
        );
      }
    }
  }

  // Сброс формы события
  function resetEventForm() {
    setEventTitle('');
    setEventDescription('');
    setEventType('meetup');
    setEventCategory('sport');
    setEventPrice('');
    setEventMaxParticipants('5');
    setEventDate(new Date());
    setEventTime(new Date());
    setEventImage(null);
    setEventImagePath(null);
    setSelectedLocation({
      latitude: 55.7558,
      longitude: 37.6173,
      address: 'Москва, центр',
    });
  }

// ===== КОМПОНЕНТ БАННЕРА =====



  // Форматирование даты и времени
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let dateString;
    if (diffDays === 0) {
      dateString = 'Сегодня';
    } else if (diffDays === 1) {
      dateString = 'Завтра';
    } else if (diffDays === 2) {
      dateString = 'Послезавтра';
    } else if (diffDays < 7) {
      dateString = `Через ${diffDays} дня`;
    } else {
      dateString = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
    }
    
    const timeString = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return `${dateString} в ${timeString}`;
  }

  // Получение оставшегося времени
  function getTimeRemaining(isoString) {
    const eventDate = new Date(isoString);
    const now = new Date();
    const diffMs = eventDate - now;
    
    if (diffMs <= 0) return 'Событие началось';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `Через ${diffDays} ${getDaysText(diffDays)}`;
    } else if (diffHours > 0) {
      return `Через ${diffHours} ${getHoursText(diffHours)}`;
    } else {
      return `Через ${diffMinutes} ${getMinutesText(diffMinutes)}`;
    }
  }

  function getDaysText(days) {
    if (days === 1) return 'день';
    if (days >= 2 && days <= 4) return 'дня';
    return 'дней';
  }

  function getHoursText(hours) {
    if (hours === 1) return 'час';
    if (hours >= 2 && hours <= 4) return 'часа';
    return 'часов';
  }

  function getMinutesText(minutes) {
    if (minutes === 1) return 'минуту';
    if (minutes >= 2 && minutes <= 4) return 'минуты';
    return 'минут';
  }

  // Форматирование времени чата
  function formatChatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  }

  // Компонент карточки события
  const EventCard = ({ event, isSelected, onSelect }) => {
    const isUserEvent = event.organizer_id === user?.id;
    const isFull = (event.current_participants || 0) >= event.max_participants;
    const isPastEvent = new Date(event.starts_at) < new Date();
    const [imageUri, setImageUri] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
      if (event.image_url) {
        try {
          let finalUrl = null;
          let cleanPath = event.image_url;
          
          if (cleanPath.includes('event_images/')) {
            cleanPath = cleanPath.replace(/^.*?event_images\//, '');
          }
          if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
          }
          
          if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
            finalUrl = cleanPath;
          } else {
            finalUrl = `${SUPABASE_URL}/storage/v1/object/public/event_images/${cleanPath}`;
          }
          
          console.log('🖼️ Загружаем фото:', finalUrl);
          
          fetch(finalUrl, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                setImageUri(finalUrl);
              } else {
                console.log('❌ Файл не найден, пробуем альтернативный путь');
                const altUrl = `${SUPABASE_URL}/storage/v1/object/public/event_images/${event.image_url}`;
                fetch(altUrl, { method: 'HEAD' })
                  .then(res => {
                    if (res.ok) {
                      setImageUri(altUrl);
                    }
                  })
                  .catch(() => {});
              }
              setImageLoading(false);
            })
            .catch(() => {
              setImageLoading(false);
            });
        } catch (error) {
          console.log('❌ Ошибка загрузки фото:', error);
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }
    }, [event.image_url]);

    // Получение опций для меню
    const getOptions = () => {
      const options = [];

      if (isUserEvent && !isPastEvent) {
        options.push({
          label: 'Редактировать',
          icon: '✏️',
          onPress: () => openEditModal(event),
        });
        options.push({
          label: 'Удалить',
          icon: '🗑️',
          destructive: true,
          onPress: () => handleDeleteMyEvent(event.id),
        });
        options.push({
          label: 'Управление заявками',
          icon: '📋',
          onPress: async () => {
            setSelectedEventForApplications(event);
            await loadApplications(event.id);
            setShowApplicationsModal(true);
          },
        });
      }

      if (!isUserEvent) {
        options.push({
          label: 'Пожаловаться',
          icon: '⚠️',
          onPress: () => {
            setSelectedEventToReport(event.id);
            setShowReportModal(true);
          },
        });
      }

      if (isModerator && !isUserEvent) {
        options.push({
          label: 'Удалить (модератор)',
          icon: '🗑️',
          destructive: true,
          onPress: () => {
            setSelectedEventToDelete(event.id);
            setShowDeleteReason(true);
          },
        });
        options.push({
          label: 'Блокировать организатора',
          icon: '🚫',
          destructive: true,
          onPress: () => {
            setSelectedUserToBlock(event.organizer_id);
            setShowBlockReason(true);
          },
        });
      }

      return options;
    };

    const handleOptionSelect = (option) => {
      if (option.onPress) {
        option.onPress();
      }
    };

    return (
      <View 
        ref={ref => eventRefs.current[event.id] = ref}
        style={[
          styles.eventCard,
          isSelected && styles.selectedEventCard,
          isPastEvent && styles.pastEventCard,
          imageUri && styles.eventCardWithImage,
        ]}
      >
        {imageUri && !imageLoading && (
          <>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.eventCardBackground}
              resizeMode="cover"
              blurRadius={3}
            />
            <View style={styles.eventCardOverlay} />
          </>
        )}

        {imageLoading && imageUri && (
          <View style={[styles.eventCardBackground, styles.imageLoadingBackground]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <View style={[styles.eventCardContent, imageUri && styles.eventCardContentWithImage]}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTitle, imageUri && styles.eventTitleLight]}>
              {event.title}
            </Text>
            <View style={styles.eventHeaderRight}>
              <View style={[
                styles.eventTypeBadge,
                event.type === 'help' ? styles.helpBadge : styles.meetupBadge
              ]}>
                <Text style={styles.eventTypeText}>
                  {event.type === 'help' ? '🔥 Помощь' : '👥 Встреча'}
                </Text>
              </View>
              <OptionsMenu
                options={getOptions()}
                onSelect={handleOptionSelect}
                style={styles.eventOptionsMenu}
              />
            </View>
          </View>

          {event.description && (
            <Text style={[styles.eventDescription, imageUri && styles.eventTextLight]}>
              {event.description}
            </Text>
          )}

          <View style={[styles.eventTimeInfo, imageUri && styles.eventTimeInfoLight]}>
            <Text style={styles.eventTimeIcon}>⏰</Text>
            <View>
              <Text style={[styles.eventDateTime, imageUri && styles.eventTextLight]}>
                {formatDateTime(event.starts_at)}
              </Text>
              <Text style={[styles.eventTimeRemaining, imageUri && styles.eventTextLight]}>
                {getTimeRemaining(event.starts_at)}
              </Text>
            </View>
          </View>

          <Text style={[styles.eventDetails, imageUri && styles.eventTextLight]}>
            👥 {event.current_participants || 0}/{event.max_participants} человек
            {isFull && <Text> • 🔴 Мест нет</Text>}
            {isPastEvent && <Text> • ⏰ Прошло</Text>}
          </Text>

          {event.type === 'help' && event.price && (
            <Text style={[styles.eventPrice, imageUri && styles.eventTextLight]}>
              💰 {parseFloat(event.price).toFixed(0)}₽
            </Text>
          )}

          {event.address && (
            <Text style={[styles.eventLocation, imageUri && styles.eventTextLight]}>
              📍 {event.address}
            </Text>
          )}

          {/* Блок кнопок: "Присоединиться" и "Показать на карте" */}
          {!isPastEvent && (
            <View style={styles.eventActionRow}>
              {!isUserEvent && (
                <TouchableOpacity
                  style={[styles.joinButtonSmall, isFull && styles.joinButtonDisabledSmall]}
                  onPress={() => handleJoinEvent(event.id)}
                  disabled={isFull}
                >
                  <Text style={styles.joinButtonTextSmall}>
                    {isFull ? '🔴' : '✅ Присоединиться'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {isUserEvent && (
                <View style={styles.joinButtonSmallPlaceholder} />
              )}

              {event.latitude && event.longitude && (
                <TouchableOpacity
                  style={styles.mapButtonSmall}
                  onPress={() => {
                    setMiniMapEvent(event);
                    setShowMiniMap(true);
                  }}
                >
                  <Text style={styles.mapButtonSmallText}>🗺️ Карта</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isUserEvent && isPastEvent && (
            <View style={styles.pastEventBadgeContainer}>
              <Text style={styles.pastEventBadgeText}>⏰ Событие завершено</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Модальное окно мини-карты
  const MiniMapModal = ({ visible, event, onClose }) => {
    if (!visible || !event) return null;

    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
        <style>
          html, body, #map { 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0;
            background: #f5f5f5;
          }
          .balloon-content {
            max-width: 220px;
            padding: 4px;
          }
          .balloon-title {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 4px;
            color: #212121;
          }
          .balloon-address {
            font-size: 13px;
            color: #424242;
            margin-bottom: 2px;
          }
          .balloon-participants {
            font-size: 12px;
            color: #757575;
            margin-bottom: 6px;
          }
          .balloon-button {
            background: #ffa726;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 6px;
            font-size: 13px;
            font-weight: bold;
            color: #212121;
            cursor: pointer;
            width: 100%;
            text-align: center;
          }
          .balloon-button:hover {
            background: #F57C00;
          }
          .balloon-button:active {
            background: #E65100;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function sendEventClick(eventId) {
            try {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              } else if (window.android) {
                window.android.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              } else if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.reactNative.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              }
            } catch (e) {
              console.error('Ошибка отправки сообщения:', e);
            }
          }

          ymaps.ready(function() {
            var event = ${JSON.stringify({
              id: event.id,
              lat: event.latitude || 55.7558,
              lon: event.longitude || 37.6173,
              title: event.title,
              address: event.address || '',
              current_participants: event.current_participants || 0,
              max_participants: event.max_participants || 0,
              emoji: getEventEmoji(event)
            })};

            var map = new ymaps.Map('map', {
              center: [event.lat, event.lon],
              zoom: 14,
              controls: ['zoomControl', 'fullscreenControl']
            });

            var balloonContent = '<div class="balloon-content">' +
              '<div class="balloon-title">' + event.emoji + ' ' + event.title + '</div>' +
              '<div class="balloon-address">' + (event.address || '') + '</div>' +
              '<div class="balloon-participants">👥 ' + event.current_participants + '/' + event.max_participants + ' участников</div>' +
              '<button class="balloon-button" onclick="sendEventClick(\\'' + event.id + '\\')">📋 Подробнее</button>' +
            '</div>';

            var placemark = new ymaps.Placemark(
              [event.lat, event.lon],
              {
                balloonContent: balloonContent,
                balloonContentLayoutWidth: 250,
                hintContent: event.emoji + ' ' + event.title
              },
              {
                preset: event.type === 'help' ? 'islands#redDotIcon' : 'islands#blueDotIcon',
                iconColor: event.type === 'help' ? '#FF6D00' : '#1E98FF'
              }
            );

            map.geoObjects.add(placemark);
            placemark.balloon.open();
          });

          function getEventEmoji(event) {
            if (event.type === 'help') return '🔨';
            const emojis = { sport: '🏐', food: '🥗', art: '🎭', repair: '🛠️', moving: '🚚', garden: '🌳' };
            return emojis[event.category] || '👥';
          }
        </script>
      </body>
      </html>
    `;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.fullContainer}>
          <LinearGradient
            colors={['#FFF8E1', '#FFE0B2']}
            style={styles.glassBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.mapHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
            <Text style={styles.mapTitle}>{event?.title || 'Местоположение'}</Text>
            <TouchableOpacity onPress={() => {
              onClose();
              setActiveTab('events');
              setSelectedEventId(event.id);
              setTimeout(() => {
                scrollToEvent(event.id);
              }, 600);
            }}>
              <Text style={styles.detailsButtonText}>📋</Text>
            </TouchableOpacity>
          </View>

          <WebView
            style={{ flex: 1, backgroundColor: '#f5f5f5' }}
            source={{ html: mapHTML }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'eventClick') {
                  onClose();
                  handleMapEventPress(data.eventId);
                }
              } catch (error) {
                console.log('Ошибка парсинга сообщения:', error);
              }
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Загрузка карты...</Text>
              </View>
            )}
          />

          <View style={styles.mapBottomArea}>
            <View style={styles.mapInfo}>
              <Text style={styles.mapInfoText}>
                📍 {event?.address || 'Местоположение события'}
              </Text>
            </View>
            <View style={styles.androidNavArea} />
          </View>
        </View>
      </Modal>
    );
  };

  // Рендер юридических документов
  if (showPrivacyPolicy) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
        <LinearGradient
          colors={['#FFF8E1', '#FFE0B2']}
          style={styles.glassBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.legalHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.legalTitle}>Политика конфиденциальности</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView style={styles.legalContent}>
          <Text style={styles.legalText}>{PRIVACY_POLICY_TEXT}</Text>
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        <View style={styles.androidNavArea} />
      </View>
    );
  }

  if (showTermsOfUse) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
        <LinearGradient
          colors={['#FFF8E1', '#FFE0B2']}
          style={styles.glassBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.legalHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <TouchableOpacity onPress={() => setShowTermsOfUse(false)}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.legalTitle}>Условия использования</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView style={styles.legalContent}>
          <Text style={styles.legalText}>{TERMS_OF_USE_TEXT}</Text>
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        <View style={styles.androidNavArea} />
      </View>
    );
  }

  // Карта
  if (showMap) {
    const points = mapEvents
      .filter(event => event.latitude && event.longitude)
      .map(event => ({
        id: event.id,
        lat: event.latitude,
        lon: event.longitude,
        title: event.title,
        type: event.type,
        category: event.category,
        price: event.price,
        address: event.address,
        emoji: getEventEmoji(event),
        description: event.description,
        current_participants: event.current_participants || 0,
        max_participants: event.max_participants || 0,
      }));

    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
        <style>
          html, body, #map { 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0;
            background: #f5f5f5;
          }
          .balloon-content {
            max-width: 220px;
            padding: 4px;
          }
          .balloon-title {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 4px;
            color: #212121;
          }
          .balloon-address {
            font-size: 13px;
            color: #424242;
            margin-bottom: 2px;
          }
          .balloon-participants {
            font-size: 12px;
            color: #757575;
            margin-bottom: 6px;
          }
          .balloon-button {
            background: #ffa726;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 6px;
            font-size: 13px;
            font-weight: bold;
            color: #212121;
            cursor: pointer;
            width: 100%;
            text-align: center;
          }
          .balloon-button:hover {
            background: #F57C00;
          }
          .balloon-button:active {
            background: #E65100;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function sendEventClick(eventId) {
            try {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              } else if (window.android) {
                window.android.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              } else if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.reactNative.postMessage(JSON.stringify({
                  type: 'eventClick',
                  eventId: eventId
                }));
              }
              console.log('Отправлен клик для события:', eventId);
            } catch (e) {
              console.error('Ошибка отправки сообщения:', e);
            }
          }

          ymaps.ready(function() {
            var map = new ymaps.Map('map', {
              center: [55.7558, 37.6173],
              zoom: 10,
              controls: ['zoomControl', 'fullscreenControl']
            });
            
            var points = ${JSON.stringify(points)};
            
            points.forEach(function(point) {
              var buttonId = 'btn_' + point.id;
              var balloonContent = '<div class="balloon-content">' +
                '<div class="balloon-title">' + point.emoji + ' ' + point.title + '</div>' +
                '<div class="balloon-address">' + (point.address || '') + '</div>' +
                '<div class="balloon-participants">👥 ' + point.current_participants + '/' + point.max_participants + ' участников</div>' +
                '<button class="balloon-button" onclick="sendEventClick(\\'' + point.id + '\\')">📋 Подробнее</button>' +
              '</div>';
              
              var placemark = new ymaps.Placemark(
                [point.lat, point.lon],
                {
                  balloonContent: balloonContent,
                  balloonContentLayoutWidth: 250,
                  hintContent: point.emoji + ' ' + point.title
                },
                {
                  preset: point.type === 'help' ? 'islands#redDotIcon' : 'islands#blueDotIcon',
                  iconColor: point.type === 'help' ? '#FF6D00' : '#1E98FF'
                }
              );
              
              map.geoObjects.add(placemark);
            });
          });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.fullContainer}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
        <LinearGradient
          colors={['#FFF8E1', '#FFE0B2']}
          style={styles.glassBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.mapHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <TouchableOpacity onPress={() => setShowMap(false)}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.mapTitle}>Карта событий</Text>
          <TouchableOpacity onPress={loadMapEvents}>
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        <WebView
          style={{ flex: 1, backgroundColor: '#f5f5f5' }}
          source={{ html: mapHTML }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log('📨 Получено сообщение из WebView:', data);
              if (data.type === 'eventClick') {
                handleMapEventPress(data.eventId);
              }
            } catch (error) {
              console.log('Ошибка парсинга сообщения:', error);
            }
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Загрузка карты...</Text>
            </View>
          )}
          onError={(error) => {
            console.log('WebView ошибка:', error);
            Alert.alert('Ошибка', 'Не удалось загрузить карту. Проверьте интернет-соединение.');
          }}
          onLoadEnd={() => {
            console.log('WebView загружен');
          }}
          injectedJavaScript={`
            if (window.ReactNativeWebView) {
              console.log('ReactNativeWebView доступен');
            } else {
              console.log('ReactNativeWebView НЕ доступен');
              window.ReactNativeWebView = {
                postMessage: function(message) {
                  if (window.android) {
                    window.android.postMessage(message);
                  }
                  if (window.webkit && window.webkit.messageHandlers) {
                    window.webkit.messageHandlers.reactNative.postMessage(message);
                  }
                }
              };
            }
            true;
          `}
        />

        <View style={styles.mapBottomArea}>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6D00' }]} />
              <Text style={styles.legendText}>🔨 Помощь</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#1E98FF' }]} />
              <Text style={styles.legendText}>👥 Встречи</Text>
            </View>
          </View>
          
          <View style={styles.mapInfo}>
            <Text style={styles.mapInfoText}>
              Показано событий: {points.length}
            </Text>
            <Text style={styles.mapHint}>
              👆 Нажмите на метку, затем "Подробнее" для перехода к событию
            </Text>
          </View>
          
          <View style={styles.androidNavArea} />
        </View>
      </View>
    );
  }

  // Экран входа
  if (!isSignedIn) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <LinearGradient
          colors={['#FFF8E1', '#FFE0B2', '#FFCC80']}
          style={styles.glassBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ScrollView 
          contentContainerStyle={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={{ uri: COMPANY_LOGO }} style={styles.logoImage} />
            <Text style={styles.title}>DOT</Text>
            <Text style={styles.subtitle}>Реальная помощь и встречи</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Создать аккаунт' : 'Войти в систему'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ваш email (КРОМЕ GMAIL)"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Пароль (6+ символов)"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '⏳ Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Или</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
  style={[styles.yandexButton, yandexLoading && styles.buttonDisabled]}
  onPress={handleYandexAuth}
  disabled={yandexLoading}
>
  <View style={styles.yandexButtonContent}>
    <Image 
      source={{ uri: 'https://yandex.ru/favicon.ico' }} 
      style={styles.yandexIcon} 
    />
    <Text style={styles.yandexButtonText}>
      {yandexLoading ? '⏳ Подключение...' : 'Войти через Яндекс'}
    </Text>
  </View>
</TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp ? '← Назад ко входу' : 'Создать новый аккаунт'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => setShowPrivacyPolicy(true)}>
              <Text style={styles.legalLinkText}>📄 Политика конфиденциальности</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTermsOfUse(true)}>
              <Text style={styles.legalLinkText}>📜 Условия использования</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>🔥 Реальные возможности:</Text>
            <Text style={styles.feature}>• Создавайте события с групповыми чатами</Text>
            <Text style={styles.feature}>• Присоединяйтесь к событиям других людей</Text>
            <Text style={styles.feature}>• Общайтесь в групповых чатах событий</Text>
            <Text style={styles.feature}>• Чаты автоматически удаляются через 24 часа</Text>
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        <View style={styles.androidNavArea} />
      </View>
    );
  }

  // Основной интерфейс
  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
      
      <LinearGradient
        colors={['#FFF8E1', '#FFE0B2', '#FFCC80']}
        style={styles.glassBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Модальные окна - Фильтры */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔍 Фильтры</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <Text style={styles.filterLabel}>Поиск по названию:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Введите название..."
              placeholderTextColor={COLORS.textLight}
              value={filters.searchQuery}
              onChangeText={(text) => setFilters({...filters, searchQuery: text})}
            />

            <Text style={styles.filterLabel}>Тип события:</Text>
            <View style={styles.filterOptions}>
              {['all', 'meetup', 'help'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.filterOptionActive
                  ]}
                  onPress={() => setFilters({...filters, type})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.type === type && styles.filterOptionTextActive
                  ]}>
                    {type === 'all' ? 'Все' : type === 'meetup' ? 'Встречи' : 'Помощь'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Дата:</Text>
            <View style={styles.filterOptions}>
              {['all', 'today', 'tomorrow', 'week'].map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.filterOption,
                    filters.date === date && styles.filterOptionActive
                  ]}
                  onPress={() => setFilters({...filters, date})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.date === date && styles.filterOptionTextActive
                  ]}>
                    {date === 'all' ? 'Все' : 
                     date === 'today' ? 'Сегодня' : 
                     date === 'tomorrow' ? 'Завтра' : 'Неделя'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Расстояние:</Text>
            <View style={styles.filterOptions}>
              {[0, 5, 10, 20].map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.filterOption,
                    filters.distance === dist && styles.filterOptionActive
                  ]}
                  onPress={() => setFilters({...filters, distance: dist})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.distance === dist && styles.filterOptionTextActive
                  ]}>
                    {dist === 0 ? 'Все' : `${dist} км`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!userLocation && filters.distance > 0 && (
              <Text style={styles.filterWarning}>
                ⚠️ Для фильтра по расстоянию включите геолокацию
              </Text>
            )}

            <TouchableOpacity
              style={styles.resetFiltersButton}
              onPress={() => {
                setFilters({
                  type: 'all',
                  date: 'all',
                  distance: 0,
                  searchQuery: '',
                });
                setShowFilters(false);
              }}
            >
              <Text style={styles.resetFiltersText}>🔄 Сбросить фильтры</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>✅ Применить</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Жалоба */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowReportModal(false);
          setSelectedEventToReport(null);
          setReportReason('');
          setReportComment('');
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowReportModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚠️ Пожаловаться</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <Text style={styles.filterLabel}>Причина жалобы:</Text>
            <View style={styles.reportOptions}>
              {['spam', 'fraud', 'offensive', 'dangerous', 'other'].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reportOption,
                    reportReason === reason && styles.reportOptionActive
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={styles.reportOptionText}>
                    {reason === 'spam' && '📧 Спам'}
                    {reason === 'fraud' && '💰 Мошенничество'}
                    {reason === 'offensive' && '🤬 Оскорбления'}
                    {reason === 'dangerous' && '⚠️ Опасно'}
                    {reason === 'other' && '❓ Другое'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Комментарий (необязательно):</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Опишите проблему подробнее..."
              placeholderTextColor={COLORS.textLight}
              value={reportComment}
              onChangeText={setReportComment}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.sendReportButton}
              onPress={handleReportEvent}
            >
              <Text style={styles.sendReportButtonText}>📨 Отправить жалобу</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Блокировка */}
      <Modal
        visible={showBlockReason}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowBlockReason(false);
          setSelectedUserToBlock(null);
          setBlockReason('');
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowBlockReason(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🚫 Причина блокировки</Text>
            <TouchableOpacity onPress={() => setShowBlockReason(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.modalInput, styles.textArea]}
            placeholder="Укажите причину блокировки..."
            value={blockReason}
            onChangeText={setBlockReason}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => {
                setShowBlockReason(false);
                setSelectedUserToBlock(null);
                setBlockReason('');
              }}
            >
              <Text style={styles.cancelModalButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmModalButton]}
              onPress={() => {
                if (selectedUserToBlock) {
                  handleBlockUser(selectedUserToBlock, blockReason || 'Нарушение правил');
                }
              }}
            >
              <Text style={styles.confirmModalButtonText}>Заблокировать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Удаление события модератором */}
      <Modal
        visible={showDeleteReason}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowDeleteReason(false);
          setSelectedEventToDelete(null);
          setDeleteReason('');
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeleteReason(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🗑️ Причина удаления</Text>
            <TouchableOpacity onPress={() => setShowDeleteReason(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.modalInput, styles.textArea]}
            placeholder="Укажите причину удаления события..."
            value={deleteReason}
            onChangeText={setDeleteReason}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => {
                setShowDeleteReason(false);
                setSelectedEventToDelete(null);
                setDeleteReason('');
              }}
            >
              <Text style={styles.cancelModalButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmModalButton]}
              onPress={() => {
                if (selectedEventToDelete) {
                  handleModeratorDeleteEvent(selectedEventToDelete, deleteReason || 'Нарушение правил');
                }
              }}
            >
              <Text style={styles.confirmModalButtonText}>Удалить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Чат по коду */}
      <Modal
        visible={showChatByCode}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowChatByCode(false);
          setChatCodeInput('');
          setGeneratedCode('');
          setIsCodeValid(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowChatByCode(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔑 Чат по коду</Text>
            <TouchableOpacity onPress={() => {
              setShowChatByCode(false);
              setChatCodeInput('');
              setGeneratedCode('');
              setIsCodeValid(false);
            }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <View style={styles.codeSection}>
              <Text style={styles.codeSectionTitle}>📤 Создать код</Text>
              <Text style={styles.codeSectionDescription}>
                Создайте временный код, чтобы другой пользователь мог подключиться к чату с вами.
                Код действителен 5 минут.
              </Text>
              
              {isCodeValid && generatedCode ? (
                <View style={styles.codeDisplayContainer}>
                  <Text style={styles.codeDisplayLabel}>Ваш код:</Text>
                  <Text style={styles.codeDisplay}>{generatedCode}</Text>
                  <Text style={styles.codeTimer}>
                    ⏰ Действителен: {Math.floor(codeTimer / 60)}:{String(codeTimer % 60).padStart(2, '0')}
                  </Text>
                  <Text style={styles.codeHint}>
                    Покажите этот код другому пользователю
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.generateCodeButton}
                  onPress={handleGenerateChatCode}
                  disabled={isGeneratingCode}
                >
                  <Text style={styles.generateCodeButtonText}>
                    {isGeneratingCode ? '⏳ Создание...' : '🔑 Создать новый код'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.codeDivider}>
              <View style={styles.codeDividerLine} />
              <Text style={styles.codeDividerText}>ИЛИ</Text>
              <View style={styles.codeDividerLine} />
            </View>

            <View style={styles.codeSection}>
              <Text style={styles.codeSectionTitle}>📥 Подключиться по коду</Text>
              <Text style={styles.codeSectionDescription}>
                Введите 6-значный код, который вам показал другой пользователь.
              </Text>

              <TextInput
                style={[styles.modalInput, styles.codeInput]}
                placeholder="Введите 6-значный код"
                placeholderTextColor={COLORS.textLight}
                value={chatCodeInput}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setChatCodeInput(cleaned);
                }}
                keyboardType="numeric"
                maxLength={6}
              />

              <TouchableOpacity
                style={[
                  styles.joinCodeButton,
                  (chatCodeInput.length !== 6 || joiningByCode) && styles.joinCodeButtonDisabled
                ]}
                onPress={handleJoinChatByCode}
                disabled={chatCodeInput.length !== 6 || joiningByCode}
              >
                <Text style={styles.joinCodeButtonText}>
                  {joiningByCode ? '⏳ Подключение...' : '🔗 Подключиться'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Модальное окно участников чата */}
      <Modal
        visible={showParticipantsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowParticipantsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowParticipantsModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.participantsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.participantsModalTitle}>👥 Участники чата</Text>
            <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            {groupParticipants.length === 0 ? (
              <Text style={styles.chatParticipantEmpty}>Нет участников</Text>
            ) : (
              groupParticipants.map((participant) => {
                const isAdmin = participant.is_admin === true;
                const isMe = participant.user_id === user.id;
                const canRemove = isChatAdmin(selectedGroupChat?.id) && !isMe && !isAdmin;
                
                return (
                  <View key={participant.user_id} style={styles.chatParticipantItem}>
                    <View style={styles.chatParticipantInfo}>
                      <UserAvatar userId={participant.user_id} size={36} />
                      <Text style={styles.chatParticipantName}>
                        {participant.profiles?.username || 'Пользователь'}
                        {participant.profiles?.role === 'moderator' && (
                          <Text style={styles.chatParticipantBadge}> 🔰</Text>
                        )}
                        {isAdmin && (
                          <View style={styles.chatParticipantAdminBadge}>
                            <Text style={styles.chatParticipantAdminText}>Админ</Text>
                          </View>
                        )}
                        {isMe && (
                          <Text style={[styles.chatParticipantBadge, { color: COLORS.primary }]}> (Вы)</Text>
                        )}
                      </Text>
                    </View>
                    {canRemove && (
                      <TouchableOpacity
                        style={styles.chatParticipantRemoveButton}
                        onPress={() => handleRemoveParticipantFromChat(selectedGroupChat.id, participant.user_id)}
                      >
                        <Text style={styles.chatParticipantRemoveText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Создание события */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔥 Создать событие</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Название события*"
              placeholderTextColor={COLORS.textLight}
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Описание"
              placeholderTextColor={COLORS.textLight}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Тип события:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventType}
                onValueChange={setEventType}
                style={styles.picker}
              >
                <Picker.Item label="👥 Встреча (бесплатно)" value="meetup" />
                <Picker.Item label="💪 Помощь (платно/бесплатно)" value="help" />
              </Picker>
            </View>

            <Text style={styles.label}>Категория:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventCategory}
                onValueChange={setEventCategory}
                style={styles.picker}
              >
                <Picker.Item label="🏐 Спорт" value="sport" />
                <Picker.Item label="🥗 Еда/Напитки" value="food" />
                <Picker.Item label="🎭 Искусство/Культура" value="art" />
                <Picker.Item label="🛠️ Ремонт/Помощь" value="repair" />
                <Picker.Item label="🚚 Переезд" value="moving" />
                <Picker.Item label="🌳 Сад/Огород" value="garden" />
              </Picker>
            </View>

            {eventType === 'help' && (
              <>
                <Text style={styles.label}>Стоимость (₽):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0 - если бесплатно"
                  placeholderTextColor={COLORS.textLight}
                  value={eventPrice}
                  onChangeText={setEventPrice}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={styles.label}>Макс. участников (1-20):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Количество участников (макс 20)"
              placeholderTextColor={COLORS.textLight}
              value={eventMaxParticipants}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                
                if (cleaned === '') {
                  setEventMaxParticipants('');
                  return;
                }
                
                const num = parseInt(cleaned);
                
                if (num > 20) {
                  setEventMaxParticipants('20');
                  Alert.alert('⚠️ Ограничение', 'Максимум 20 участников');
                  return;
                }
                
                if (num === 0 && cleaned.length > 0) {
                  setEventMaxParticipants('1');
                  Alert.alert('⚠️ Ограничение', 'Минимум 1 участник');
                  return;
                }
                
                setEventMaxParticipants(cleaned);
              }}
              keyboardType="numeric"
              maxLength={2}
            />

            <Text style={styles.label}>Место проведения:</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationButtonText}>
                📍 {selectedLocation.address || 'Выбрать на карте'}
              </Text>
            </TouchableOpacity>

            {selectedLocation.latitude && selectedLocation.longitude && (
              <Text style={styles.coordinatesText}>
                Координаты: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            )}

            <Text style={styles.label}>📸 Фото события (необязательно):</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickEventImage}
            >
              <Text style={styles.imagePickerButtonText}>
                {eventImage ? '🔄 Заменить фото' : '📷 Добавить фото'}
              </Text>
            </TouchableOpacity>

            {eventImage && (
              <View style={styles.eventImagePreviewContainer}>
                <Image 
                  source={{ uri: eventImage }} 
                  style={styles.eventImagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeEventImageButton}
                  onPress={() => {
                    setEventImage(null);
                    setEventImagePath(null);
                  }}
                >
                  <Text style={styles.removeEventImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Дата и время:</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                📅 {eventDate.toLocaleDateString('ru-RU')}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const now = new Date();
                    const newDate = new Date(selectedDate);
                    if (newDate < now) {
                      Alert.alert('Ошибка', 'Дата не может быть в прошлом');
                      return;
                    }
                    setEventDate(newDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                🕐 {eventTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setEventTime(selectedTime);
                  }
                }}
              />
            )}

            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                💡 Групповой чат будет создан автоматически и удалится через 24 часа после начала события
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createEventButton}
              onPress={handleCreateEvent}
            >
              <Text style={styles.createEventButtonText}>🔥 Создать событие</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Редактирование события */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
          resetEventForm();
        }}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✏️ Редактировать событие</Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditingEvent(null);
              resetEventForm();
            }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Название события*"
              placeholderTextColor={COLORS.textLight}
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Описание"
              placeholderTextColor={COLORS.textLight}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Тип события:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventType}
                onValueChange={setEventType}
                style={styles.picker}
              >
                <Picker.Item label="👥 Встреча (бесплатно)" value="meetup" />
                <Picker.Item label="💪 Помощь (платно/бесплатно)" value="help" />
              </Picker>
            </View>

            <Text style={styles.label}>Категория:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={eventCategory}
                onValueChange={setEventCategory}
                style={styles.picker}
              >
                <Picker.Item label="🏐 Спорт" value="sport" />
                <Picker.Item label="🥗 Еда/Напитки" value="food" />
                <Picker.Item label="🎭 Искусство/Культура" value="art" />
                <Picker.Item label="🛠️ Ремонт/Помощь" value="repair" />
                <Picker.Item label="🚚 Переезд" value="moving" />
                <Picker.Item label="🌳 Сад/Огород" value="garden" />
              </Picker>
            </View>

            {eventType === 'help' && (
              <>
                <Text style={styles.label}>Стоимость (₽):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0 - если бесплатно"
                  placeholderTextColor={COLORS.textLight}
                  value={eventPrice}
                  onChangeText={setEventPrice}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={styles.label}>Макс. участников (1-20):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Количество участников (макс 20)"
              placeholderTextColor={COLORS.textLight}
              value={eventMaxParticipants}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                
                if (cleaned === '') {
                  setEventMaxParticipants('');
                  return;
                }
                
                const num = parseInt(cleaned);
                
                if (num > 20) {
                  setEventMaxParticipants('20');
                  Alert.alert('⚠️ Ограничение', 'Максимум 20 участников');
                  return;
                }
                
                if (num === 0 && cleaned.length > 0) {
                  setEventMaxParticipants('1');
                  Alert.alert('⚠️ Ограничение', 'Минимум 1 участник');
                  return;
                }
                
                setEventMaxParticipants(cleaned);
              }}
              keyboardType="numeric"
              maxLength={2}
            />

            <Text style={styles.label}>Место проведения:</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationButtonText}>
                📍 {selectedLocation.address || 'Выбрать на карте'}
              </Text>
            </TouchableOpacity>

            {selectedLocation.latitude && selectedLocation.longitude && (
              <Text style={styles.coordinatesText}>
                Координаты: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            )}

            <Text style={styles.label}>📸 Фото события (необязательно):</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickEventImage}
            >
              <Text style={styles.imagePickerButtonText}>
                {eventImage ? '🔄 Заменить фото' : '📷 Добавить фото'}
              </Text>
            </TouchableOpacity>

            {eventImage && (
              <View style={styles.eventImagePreviewContainer}>
                <Image 
                  source={{ uri: eventImage }} 
                  style={styles.eventImagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeEventImageButton}
                  onPress={() => {
                    setEventImage(null);
                    setEventImagePath(null);
                  }}
                >
                  <Text style={styles.removeEventImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Дата и время:</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                📅 {eventDate.toLocaleDateString('ru-RU')}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const now = new Date();
                    const newDate = new Date(selectedDate);
                    if (newDate < now) {
                      Alert.alert('Ошибка', 'Дата не может быть в прошлом');
                      return;
                    }
                    setEventDate(newDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                🕐 {eventTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setEventTime(selectedTime);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.updateEventButton}
              onPress={handleUpdateEvent}
            >
              <Text style={styles.updateEventButtonText}>💾 Сохранить изменения</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingEvent(null);
                resetEventForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Выбор местоположения */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.fullContainer}>
          <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
          <LinearGradient
            colors={['#FFF8E1', '#FFE0B2']}
            style={styles.glassBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.locationModalHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
            <Text style={styles.locationModalTitle}>Выберите место на карте</Text>
            <TouchableOpacity 
              style={styles.confirmLocationButton}
              onPress={() => {
                setSelectedLocation({
                  latitude: tempLocation.latitude,
                  longitude: tempLocation.longitude,
                  address: tempLocation.address || `📍 ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`,
                });
                setShowLocationPicker(false);
                Alert.alert('Локация выбрана', 'Место проведения установлено');
              }}
            >
              <Text style={styles.confirmButtonText}>✅ Выбрать</Text>
            </TouchableOpacity>
          </View>
          
          <WebView
            style={styles.locationMap}
            originWhitelist={['*']}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
                  <style>
                    html, body, #map {
                      width: 100%;
                      height: 100%;
                      margin: 0;
                      padding: 0;
                    }
                  </style>
                </head>
                <body>
                  <div id="map"></div>
                  <script type="text/javascript">
                    var currentLocation = {
                      lat: ${tempLocation.latitude},
                      lng: ${tempLocation.longitude}
                    };
                    
                    ymaps.ready(init);
                    
                    function init() {
                      var map = new ymaps.Map("map", {
                        center: [currentLocation.lat, currentLocation.lng],
                        zoom: 12,
                        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
                      });
                      
                      var placemark = new ymaps.Placemark(
                        [currentLocation.lat, currentLocation.lng],
                        {},
                        {
                          preset: 'islands#redIcon',
                          draggable: true
                        }
                      );
                      
                      map.geoObjects.add(placemark);
                      
                      placemark.events.add('dragend', function(e) {
                        var coords = placemark.geometry.getCoordinates();
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'location',
                          latitude: coords[0],
                          longitude: coords[1]
                        }));
                      });
                      
                      map.events.add('click', function(e) {
                        var coords = e.get('coords');
                        placemark.geometry.setCoordinates(coords);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'location',
                          latitude: coords[0],
                          longitude: coords[1]
                        }));
                      });
                    }
                  </script>
                </body>
                </html>
              `
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'location') {
                  setTempLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: `📍 ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
                  });
                }
              } catch (error) {
                console.log('Error parsing message:', error);
              }
            }}
          />
          
          <View style={styles.locationInfo}>
            <Text style={styles.locationInfoText}>
              Нажмите на карту или перетащите метку
            </Text>
            <Text style={styles.locationCoordinates}>
              Широта: {tempLocation.latitude.toFixed(6)}
              {' | '}
              Долгота: {tempLocation.longitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.androidNavArea} />
        </View>
      </Modal>

      {/* Модальное окно заявок */}
      <Modal
        visible={showApplicationsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowApplicationsModal(false);
          setSelectedEventForApplications(null);
        }}
      >
        <View style={styles.fullContainer}>
          <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
          <LinearGradient
            colors={['#FFF8E1', '#FFE0B2']}
            style={styles.glassBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.applicationsModalHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <TouchableOpacity onPress={() => {
              setShowApplicationsModal(false);
              setSelectedEventForApplications(null);
            }}>
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
            <Text style={styles.applicationsModalTitle}>
              {selectedEventForApplications ? '🔥 Заявки на участие' : '🔥 Мои события'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {selectedEventForApplications ? (
            <ScrollView style={styles.applicationsList}>
              <View style={styles.eventInfoCard}>
                <Text style={styles.eventInfoTitle}>{selectedEventForApplications.title}</Text>
                <Text style={styles.eventInfoDetails}>
                  👥 {selectedEventForApplications.current_participants || 0}/{selectedEventForApplications.max_participants} участников
                </Text>
                <Text style={styles.eventTimeRemaining}>
                  ⏰ {getTimeRemaining(selectedEventForApplications.starts_at)}
                </Text>
                <Text style={styles.chatInfo}>
                  💬 Групповой чат создан автоматически
                </Text>
              </View>

              <Text style={styles.applicationsSectionTitle}>
                Заявки на участие ({selectedEventApplications.length})
              </Text>

              {selectedEventApplications.length === 0 ? (
                <Text style={styles.noApplicationsText}>Нет заявок на рассмотрении</Text>
              ) : (
                selectedEventApplications.map((application) => (
                  <View key={application.id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <View style={styles.applicationUserInfo}>
                        <UserAvatar userId={application.user_id} size={40} />
                        <View>
                          <Text style={styles.applicationUserName}>
                            {application.profiles?.full_name || application.profiles?.username || 'Пользователь'}
                            {application.profiles?.role === 'moderator' && (
                              <Text style={styles.moderatorBadge}> 🔰 Модератор</Text>
                            )}
                          </Text>
                          <Text style={styles.applicationUserRating}>
                            ⭐ {application.profiles?.rating || 5.0}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.applicationDate}>
                        {new Date(application.applied_at).toLocaleDateString('ru-RU')}
                      </Text>
                    </View>

                    <View style={styles.applicationActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptApplication(application.id, application.user_id)}
                        disabled={(selectedEventForApplications.current_participants || 0) >= selectedEventForApplications.max_participants}
                      >
                        <Text style={styles.acceptButtonText}>
                          {(selectedEventForApplications.current_participants || 0) >= selectedEventForApplications.max_participants 
                            ? 'Мест нет' 
                            : '✅ Принять'}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectApplication(application.id)}
                      >
                        <Text style={styles.rejectButtonText}>❌ Отклонить</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveParticipant(
                          selectedEventForApplications.id,
                          application.user_id,
                          application.id
                        )}
                      >
                        <Text style={styles.removeButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.viewProfileButton}
                      onPress={() => {
                        setSelectedProfileUserId(application.user_id);
                        setShowProfileViewer(true);
                      }}
                    >
                      <Text style={styles.viewProfileButtonText}>👤 Посмотреть профиль</Text>
                    </TouchableOpacity>

                    {isModerator && application.user_id !== user.id && (
                      <TouchableOpacity
                        style={styles.blockUserButton}
                        onPress={() => {
                          setSelectedUserToBlock(application.user_id);
                          setShowBlockReason(true);
                        }}
                      >
                        <Text style={styles.blockUserButtonText}>🚫 Заблокировать пользователя</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : (
            <ScrollView style={styles.myEventsList}>
              <Text style={styles.myEventsTitle}>🔥 События которые вы создали:</Text>

              {myCreatedEvents.length === 0 ? (
                <Text style={styles.noEventsText}>Вы еще не создали события</Text>
              ) : (
                myCreatedEvents.map((event) => {
                  const isPastEvent = new Date(event.starts_at) < new Date();
                  return (
                    <View
                      key={event.id}
                      style={[
                        styles.myEventCard,
                        isPastEvent && styles.pastEventCard
                      ]}
                    >
                      <Text style={styles.myEventTitle}>{event.title}</Text>
                      <Text style={styles.myEventDetails}>
                        📅 {formatDateTime(event.starts_at)}
                      </Text>
                      <Text style={styles.myEventDetails}>
                        👥 {event.current_participants || 0}/{event.max_participants} участников
                      </Text>
                      <Text style={styles.myEventDetails}>
                        💬 Групповой чат активен
                      </Text>
                      
                      <View style={[
                        styles.eventStatusBadge,
                        isPastEvent ? styles.pastEventBadge : 
                        event.current_participants >= event.max_participants ? styles.completedEventBadge : styles.activeEventBadge
                      ]}>
                        <Text style={styles.eventStatusText}>
                          {isPastEvent ? '⏰ Прошедшее' : 
                           event.current_participants >= event.max_participants ? '🟢 Завершено' : '🟡 Активно'}
                        </Text>
                      </View>

                      {!isPastEvent && (
                        <View style={styles.myEventActions}>
                          <TouchableOpacity
                            style={styles.myEventEditButton}
                            onPress={() => openEditModal(event)}
                          >
                            <Text style={styles.myEventEditButtonText}>✏️ Редактировать</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.myEventDeleteButton}
                            onPress={() => handleDeleteMyEvent(event.id)}
                          >
                            <Text style={styles.myEventDeleteButtonText}>🗑️ Удалить</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.myEventApplicationsButton}
                            onPress={async () => {
                              setSelectedEventForApplications(event);
                              await loadApplications(event.id);
                            }}
                          >
                            <Text style={styles.myEventApplicationsButtonText}>📋 Заявки</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
          
          <View style={styles.androidNavArea} />
        </View>
      </Modal>

      {/* Просмотр профиля */}
      <ProfileViewerModal
        visible={showProfileViewer}
        userId={selectedProfileUserId}
        onClose={() => {
          setShowProfileViewer(false);
          setSelectedProfileUserId(null);
        }}
      />

      {/* Просмотр фото */}
      <ImageViewerModal
        visible={showImageViewer}
        imageUri={selectedImage}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage(null);
        }}
      />

      {/* Редактирование профиля */}
      <Modal
        visible={showProfileEdit}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileEdit(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowProfileEdit(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✏️ Редактировать профиль</Text>
            <TouchableOpacity onPress={() => setShowProfileEdit(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileEditAvatarContainer}>
            <TouchableOpacity onPress={uploadAvatar} style={styles.profileEditAvatar}>
              <UserAvatar userId={user?.id} size={80} />
              <View style={styles.profileEditAvatarOverlay}>
                <Text style={styles.profileEditAvatarOverlayText}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.profileEditAvatarHint}>Нажмите на аватар, чтобы изменить</Text>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Имя пользователя"
            placeholderTextColor={COLORS.textLight}
            value={editUsername}
            onChangeText={setEditUsername}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Полное имя"
            placeholderTextColor={COLORS.textLight}
            value={editFullName}
            onChangeText={setEditFullName}
          />

          <TextInput
            style={[styles.modalInput, styles.textArea]}
            placeholder="О себе"
            placeholderTextColor={COLORS.textLight}
            value={editBio}
            onChangeText={setEditBio}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.modalHint}>
            Имя пользователя будет отображаться в чатах и событиях
          </Text>

          <TouchableOpacity
            style={[styles.saveProfileButton, loadingProfile && styles.saveProfileButtonDisabled]}
            onPress={updateProfile}
            disabled={loadingProfile}
          >
            <Text style={styles.saveProfileButtonText}>
              {loadingProfile ? '⏳ Сохранение...' : '💾 Сохранить изменения'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowProfileEdit(false)}
            disabled={loadingProfile}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Мини-карта события */}
      <MiniMapModal
        visible={showMiniMap}
        event={miniMapEvent}
        onClose={() => {
          setShowMiniMap(false);
          setMiniMapEvent(null);
        }}
      />

      {/* Основной контент */}
      <View style={styles.contentContainer}>
        {activeTab === 'events' && (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.mainScrollView}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
                progressBackgroundColor={COLORS.surface}
              />
            }
          >
            <View style={[styles.mainHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
              <TouchableOpacity 
                onPress={() => setActiveTab('profile')}
                style={styles.avatarHeaderButton}
              >
                <UserAvatar userId={user?.id} size={44} />
              </TouchableOpacity>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcome}>🔥 Привет, {profile?.username || user?.email?.split('@')[0] || 'Пользователь'}!</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {isModerator && (
                  <View style={styles.moderatorHeaderBadge}>
                    <Text style={styles.moderatorHeaderText}>🔰 Модератор</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.logoutBtn} 
                onPress={async () => {
                  await supabase.auth.signOut();
                  setIsSignedIn(false);
                  setUser(null);
                  setProfile(null);
                }}
              >
                <Text style={styles.logoutText}>Выйти</Text>
              </TouchableOpacity>
            </View>

            <AnimatedGradientCard style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>➕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => setShowMap(true)}
              >
                <Text style={styles.mapButtonText}>🗺️ Карта</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.myEventsButton}
                onPress={() => setShowApplicationsModal(true)}
              >
                <Text style={styles.myEventsButtonText}>📋 Мои</Text>
              </TouchableOpacity>
            </AnimatedGradientCard>

            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Поиск событий..."
                  placeholderTextColor={COLORS.textLight}
                  value={filters.searchQuery}
                  onChangeText={(text) => setFilters({...filters, searchQuery: text})}
                />
              </View>
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  (filters.type !== 'all' || filters.date !== 'all' || filters.distance > 0) && styles.filterButtonActive
                ]}
                onPress={() => setShowFilters(true)}
              >
                <Text style={styles.filterButtonText}>⚙️</Text>
              </TouchableOpacity>
            </View>

            {(filters.type !== 'all' || filters.date !== 'all' || filters.distance > 0) && (
              <View style={styles.activeFilters}>
                {filters.type !== 'all' && (
                  <View style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>
                      {filters.type === 'meetup' ? 'Встречи' : 'Помощь'}
                    </Text>
                  </View>
                )}
                {filters.date !== 'all' && (
                  <View style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>
                      {filters.date === 'today' ? 'Сегодня' : 
                       filters.date === 'tomorrow' ? 'Завтра' : 'Неделя'}
                    </Text>
                  </View>
                )}
                {filters.distance > 0 && (
                  <View style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>До {filters.distance} км</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.eventsSection}>
              <Text style={styles.sectionTitle}>
                {filteredEvents.length > 0 ? `🔥 Найдено событий: ${filteredEvents.length}` : 'Нет подходящих событий'}
              </Text>

              {loadingEvents ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Загрузка событий...</Text>
                </View>
              ) : filteredEvents.length === 0 ? (
                <View style={styles.noEventsCard}>
                  <Text style={styles.noEventsIcon}>📅</Text>
                  <Text style={styles.noEventsTitle}>Нет событий по фильтрам</Text>
                  <Text style={styles.noEventsText}>
                    Попробуйте изменить параметры поиска
                  </Text>
                  <TouchableOpacity 
                    style={styles.createFirstButton}
                    onPress={() => {
                      setFilters({
                        type: 'all',
                        date: 'all',
                        distance: 0,
                        searchQuery: '',
                      });
                    }}
                  >
                    <Text style={styles.createFirstButtonText}>🔄 Сбросить фильтры</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={event.id === selectedEventId}
                    onSelect={() => setSelectedEventId(event.id)}
                  />
                ))
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🔥 Как это работает:</Text>
              <Text style={styles.infoText}>
                1. Создавайте события - автоматически создается групповой чат{'\n'}
                2. Принимайте заявки - участники добавляются в чат автоматически{'\n'}
                3. Общайтесь в групповых чатах событий в реальном времени{'\n'}
                4. Чаты автоматически удаляются через 24 часа после события
              </Text>
              <Text style={styles.timestampInfo}>
                🕒 Обновлено: {new Date().toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </ScrollView>
        )}

        {activeTab === 'groupChats' && (
          <View style={styles.chatsContainer}>
            {selectedGroupChat ? (
              <View style={styles.chatScreenContainer}>
                <View style={[styles.chatHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
                  <TouchableOpacity 
                    style={styles.backToChatsButton}
                    onPress={closeChat}
                  >
                    <Text style={styles.backButtonText}>←</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.chatHeaderInfo}>
                    <Text style={styles.chatHeaderName}>
                      {selectedGroupChat.eventTitle || selectedGroupChat.title || 'Чат'}
                    </Text>
                    <View style={styles.chatHeaderSubInfo}>
                      <TouchableOpacity 
                        style={styles.participantsCountButton}
                        onPress={handleShowParticipants}
                      >
                        <Text style={styles.chatHeaderEvent}>
                          👥 {groupParticipants.length} участников
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.connectionStatus}>
                        <View style={[
                          styles.connectionDot,
                          connectionStatus === 'connected' && styles.connectionDotConnected,
                          connectionStatus === 'disconnected' && styles.connectionDotDisconnected,
                          connectionStatus === 'error' && styles.connectionDotError,
                        ]} />
                        <Text style={styles.connectionStatusText}>
                          {connectionStatus === 'connected' ? '🟢 Онлайн' : 
                           connectionStatus === 'disconnected' ? '🟡 Подключение...' : 
                           '🔴 Ошибка'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <OptionsMenu
                    options={[
                      ...(isChatAdmin(selectedGroupChat?.id) ? [
                        {
                          label: 'Изменить аватар чата',
                          icon: '🖼️',
                          onPress: () => handleChangeChatAvatar(selectedGroupChat.id),
                        },
                        {
                          label: 'Управление участниками',
                          icon: '👥',
                          onPress: handleShowParticipants,
                        },
                        {
                          label: 'Удалить чат',
                          icon: '🗑️',
                          destructive: true,
                          onPress: () => handleDeleteChat(selectedGroupChat.id),
                        }
                      ] : []),
                      {
                        label: 'Покинуть чат',
                        icon: '🚪',
                        onPress: () => handleLeaveChat(selectedGroupChat.id),
                      }
                    ]}
                    onSelect={(option) => {
                      if (option.onPress) option.onPress();
                    }}
                    style={styles.chatOptionsMenu}
                  />
                </View>

                <View style={styles.chatContentContainer}>
                  {loadingGroupMessages ? (
                    <View style={styles.loadingMessagesContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.loadingText}>Загрузка сообщений...</Text>
                    </View>
                  ) : groupMessages.length === 0 ? (
                    <View style={styles.noMessagesContainer}>
                      <Text style={styles.noMessagesIcon}>💬</Text>
                      <Text style={styles.noMessagesTitle}>Нет сообщений</Text>
                      <Text style={styles.noMessagesText}>
                        Будьте первым, кто напишет в этом чате!
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={groupMessages}
                      keyExtractor={(item, index) => {
                        if (item.isTemp) {
                          return `temp-${item.id}`;
                        }
                        return `msg-${item.id}-${item.created_at || index}`;
                      }}
                      renderItem={({ item }) => (
                        <AnimatedMessage
                          message={item}
                          isMyMessage={item.sender_id === user.id}
                          onImagePress={(uri) => {
                            setSelectedImage(uri);
                            setShowImageViewer(true);
                          }}
                          onProfilePress={(userId) => {
                            setSelectedProfileUserId(userId);
                            setShowProfileViewer(true);
                          }}
                        />
                      )}
                      contentContainerStyle={styles.messagesList}
                      ref={groupMessagesEndRef}
                      onContentSizeChange={() => groupMessagesEndRef.current?.scrollToEnd({ animated: true })}
                      keyboardShouldPersistTaps="handled"
                      style={styles.messagesFlatList}
                      ListFooterComponent={<View style={{ height: 80 }} />}
                    />
                  )}

                  <View style={styles.messageInputWrapper}>
                    <View style={styles.messageInputContainer}>
                      <TouchableOpacity
                        style={styles.photoButton}
                        onPress={sendImageMessage}
                        disabled={sendingImage}
                      >
                        <Text style={styles.photoButtonText}>
                          {sendingImage ? '⏳' : '📷'}
                        </Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.messageInput}
                        placeholder={sendingImage ? 'Загрузка фото...' : "Введите сообщение..."}
                        placeholderTextColor={COLORS.textLight}
                        value={newGroupMessage}
                        onChangeText={setNewGroupMessage}
                        multiline
                        maxLength={500}
                        onSubmitEditing={sendGroupMessage}
                        editable={!sendingImage}
                      />

                      <TouchableOpacity 
                        style={[styles.sendButton, (!newGroupMessage.trim() && !sendingImage) && styles.sendButtonDisabled]}
                        onPress={sendGroupMessage}
                        disabled={!newGroupMessage.trim() || sendingGroupMessage || sendingImage}
                      >
                        <Text style={styles.sendButtonText}>
                          {sendingGroupMessage ? '⏳' : '📤'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View style={[styles.chatsHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
                  <View style={styles.chatsHeaderSpacer} />
                  <Text style={styles.chatsTitle}>Чаты</Text>
                  <TouchableOpacity 
                    style={styles.refreshChatsButton}
                    onPress={loadGroupChats}
                    disabled={loadingGroupChats}
                  >
                    <Text style={styles.refreshChatsButtonText}>
                      {loadingGroupChats ? '🔄' : '🔄'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {loadingGroupChats ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Загрузка чатов...</Text>
                  </View>
                ) : groupChats.length === 0 ? (
                  <ScrollView 
                    contentContainerStyle={[styles.noChatsScrollContainer, { paddingBottom: 120 }]}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View style={styles.noChatsContainer}>
                      <Text style={styles.noChatsIcon}>👥</Text>
                      <Text style={styles.noChatsTitle}>Нет групповых чатов</Text>
                      <Text style={styles.noChatsText}>
                        Вы пока не участвуете ни в одном событии с групповым чатом.{'\n'}
                        Присоединитесь к событию или создайте своё!
                      </Text>
                      <TouchableOpacity 
                        style={styles.backToEventsButton}
                        onPress={() => setActiveTab('events')}
                      >
                        <Text style={styles.backToEventsButtonText}>🔥 Перейти к событиям</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                ) : (
                  <FlatList
                    data={groupChats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.chatItem}
                        onPress={() => loadGroupChatMessages(item)}
                      >
                        <View style={[styles.chatAvatar, styles.groupChatAvatar]}>
                          {item.avatar_url ? (
                            <Image 
                              source={{ 
                                uri: `${SUPABASE_URL}/storage/v1/object/public/avatars/${item.avatar_url}`
                              }} 
                              style={{ width: 50, height: 50, borderRadius: 25 }}
                            />
                          ) : (
                            <Text style={styles.chatAvatarText}>👥</Text>
                          )}
                        </View>
                        <View style={styles.chatInfo}>
                          <View style={styles.chatHeaderRow}>
                            <Text style={styles.chatUserName}>
                              {item.eventTitle || item.title || 'Чат'}
                            </Text>
                            <Text style={styles.chatTime}>
                              {formatChatTime(item.lastMessageTime)}
                            </Text>
                          </View>
                          <Text style={styles.chatLastMessage} numberOfLines={1}>
                            {item.lastMessage || 'Нет сообщений'}
                          </Text>
                          <View style={styles.chatFooter}>
                            <Text style={styles.chatParticipants}>
                              👥 {item.participantsCount} участников
                            </Text>
                            <Text style={styles.chatExpiry}>
                              ⏰ {item.expires_at ? new Date(item.expires_at).toLocaleDateString('ru-RU') : 'Не указано'}
                            </Text>
                          </View>
                        </View>
                        {item.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={[styles.chatsList, { paddingBottom: 120 }]}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'profile' && (
          <ScrollView 
            style={styles.profileScrollView}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View style={[styles.profileHeader, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
              <View style={styles.profileHeaderSpacer} />
              <Text style={styles.profileTitle}>Мой профиль</Text>
            </View>

            {loadingProfile ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Загрузка профиля...</Text>
              </View>
            ) : profile ? (
              <View style={styles.profileContent}>
                <View style={styles.profileCard}>
                  <TouchableOpacity onPress={uploadAvatar} style={styles.profileAvatar}>
                    <UserAvatar userId={user?.id} size={100} />
                    <View style={styles.profileAvatarOverlay}>
                      <Text style={styles.profileAvatarOverlayText}>📷</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {profile.full_name || 'Не указано'}
                    </Text>
                    <Text style={styles.profileUsername}>
                      @{profile.username}
                      {isModerator && (
                        <Text style={styles.moderatorBadge}> 🔰 Модератор</Text>
                      )}
                    </Text>
                    <Text style={styles.profileEmail}>
                      📧 {user?.email}
                    </Text>

                    {profile.bio && (
                      <Text style={styles.profileBio}>{profile.bio}</Text>
                    )}
                    
                    <View style={styles.profileStats}>
                      <View style={styles.profileStat}>
                        <Text style={styles.profileStatNumber}>{profile.rating || 5.0}</Text>
                        <Text style={styles.profileStatLabel}>Рейтинг</Text>
                      </View>
                      <View style={styles.profileStat}>
                        <Text style={styles.profileStatNumber}>{profile.help_count || 0}</Text>
                        <Text style={styles.profileStatLabel}>Помощь</Text>
                      </View>
                      <View style={styles.profileStat}>
                        <Text style={styles.profileStatNumber}>{profile.meetup_count || 0}</Text>
                        <Text style={styles.profileStatLabel}>Встречи</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => setShowProfileEdit(true)}
                >
                  <Text style={styles.editProfileButtonText}>✏️ Редактировать профиль</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createChatButton}
                  onPress={() => setShowChatByCode(true)}
                >
                  <Text style={styles.createChatButtonText}>🔑 Чат по коду</Text>
                </TouchableOpacity>

                <View style={styles.profileInfoCard}>
                  <Text style={styles.infoCardTitle}>📊 Статистика</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Дата регистрации:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Всего событий:</Text>
                    <Text style={styles.infoValue}>{myCreatedEvents.length}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Активных чатов:</Text>
                    <Text style={styles.infoValue}>{groupChats.length}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Участник в:</Text>
                    <Text style={styles.infoValue}>
                      {events.filter(e => e.organizer_id !== user.id).length} событиях
                    </Text>
                  </View>
                </View>

                <View style={styles.legalSection}>
                  <Text style={styles.legalSectionTitle}>📜 Юридические документы</Text>
                  <TouchableOpacity 
                    style={styles.legalButton}
                    onPress={() => setShowPrivacyPolicy(true)}
                  >
                    <Text style={styles.legalButtonText}>📄 Политика конфиденциальности</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.legalButton}
                    onPress={() => setShowTermsOfUse(true)}
                  >
                    <Text style={styles.legalButtonText}>📜 Условия использования</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>ℹ️ О групповых чатах:</Text>
                  <Text style={styles.infoText}>
                    • Создаются автоматически при создании события{'\n'}
                    • Участники добавляются при принятии их заявок{'\n'}
                    • Удаляются через 24 часа после начала события{'\n'}
                    • Доступны только участникам события{'\n'}
                    • Сообщения приходят в реальном времени
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noProfileContainer}>
                <Text style={styles.noProfileText}>Профиль не загружен</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadProfile}
                >
                  <Text style={styles.retryButtonText}>Повторить попытку</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
        
      </View>







              {!isChatOpen && (
          <>
            <View style={[styles.bottomNavigation, { marginBottom: Platform.OS === 'android' ? 40 : 0 }]}>
              <TouchableOpacity
                style={[styles.navItem, activeTab === 'events' && styles.navItemActive]}
                onPress={() => setActiveTab('events')}
              >
                <Text style={[styles.navIcon, activeTab === 'events' && styles.navIconActive]}>🔥</Text>
                <Text style={[styles.navText, activeTab === 'events' && styles.navTextActive]}>События</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navItem, activeTab === 'groupChats' && styles.navItemActive]}
                onPress={() => setActiveTab('groupChats')}
              >
                <Text style={[styles.navIcon, activeTab === 'groupChats' && styles.navIconActive]}>👥</Text>
                <Text style={[styles.navText, activeTab === 'groupChats' && styles.navTextActive]}>Чаты</Text>
                {groupChats.length > 0 && (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{groupChats.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
                onPress={() => setActiveTab('profile')}
              >
                <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
                <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Профиль</Text>
              </TouchableOpacity>
            </View>
            
            {/* 👇👇👇 БАННЕР MYTARGET 👇👇👇 */}
            <View style={styles.adBannerContainer}>
              <MyTargetBanner 
                slotId="2061029" 
                adSize="320x50"
                style={styles.adBanner}
              />
            </View>
            {/* 👆👆👆 КОНЕЦ БАННЕРА 👆👆👆 */}
          </>
        )}
        <View style={styles.androidNavArea} />
        </View>
        );
        }

// Стили
const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '500',
  },
  legalLinks: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  legalLinkText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  features: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  feature: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  yandexButton: {
    backgroundColor: '#FC3F1D',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  yandexButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yandexIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 4,
  },
  yandexButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legalHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 15,
  },
  legalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  legalContent: {
    flex: 1,
    padding: 20,
  },
  legalText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  mapHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 15,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40,
  },
  refreshButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  detailsButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  mapBottomArea: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    position: 'relative',
    paddingBottom: 25,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: 15,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.9)',
  },
  legendText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  mapInfo: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    padding: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
  },
  mapInfoText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  mapHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  mainScrollView: {
    flex: 1,
  },
  mainHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 2,
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: 'rgba(33,33,33,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  logoutText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  moderatorHeaderBadge: {
    backgroundColor: 'rgba(156,39,176,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  moderatorHeaderText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: COLORS.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  createButton: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  mapButton: {
    backgroundColor: 'rgba(255,179,0,0.9)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  mapButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  myEventsButton: {
    backgroundColor: 'rgba(33,33,33,0.9)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  myEventsButtonText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(245,124,0,0.9)',
    borderColor: COLORS.primaryDark,
  },
  filterButtonText: {
    fontSize: 20,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  activeFilter: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  activeFilterText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 15,
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    borderColor: COLORS.primaryDark,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterOptionTextActive: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  filterWarning: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 10,
    fontStyle: 'italic',
  },
  resetFiltersButton: {
    backgroundColor: 'rgba(117,117,117,0.9)',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  resetFiltersText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyFiltersButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  applyFiltersText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  selectedEventCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pastEventCard: {
    opacity: 0.8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  eventTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.9)',
  },
  helpBadge: {
    backgroundColor: 'rgba(255,167,38,0.9)',
  },
  meetupBadge: {
    backgroundColor: 'rgba(255,179,0,0.9)',
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,224,178,0.9)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  eventTimeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  eventDateTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  eventTimeRemaining: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  eventPrice: {
    fontSize: 17,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  eventLocation: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  eventActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  joinButtonSmall: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
    flex: 1,
  },
  joinButtonDisabledSmall: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  joinButtonTextSmall: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  joinButtonSmallPlaceholder: {
    flex: 1,
  },
  mapButtonSmall: {
    backgroundColor: 'rgba(33,33,33,0.85)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
    flex: 1,
  },
  mapButtonSmallText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  pastEventBadgeContainer: {
    backgroundColor: 'rgba(117,117,117,0.9)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  pastEventBadgeText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsMenuContainer: {
    position: 'relative',
  },
  optionsMenuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenuDots: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  optionsMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  optionsMenuDropdown: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 1000,
  },
  optionsMenuItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionsMenuItemLast: {
    borderBottomWidth: 0,
  },
  optionsMenuItemDestructive: {
    backgroundColor: 'rgba(211,47,47,0.1)',
  },
  optionsMenuItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionsMenuItemTextDestructive: {
    color: COLORS.error,
    fontWeight: '600',
  },
  avatarContainer: {
    backgroundColor: 'rgba(33,33,33,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  profileViewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  profileViewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileViewerContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    padding: 30,
    width: width * 0.9,
    maxHeight: height * 0.8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
  },
  profileViewerClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  profileViewerCloseText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  profileViewerAvatar: {
    marginBottom: 16,
  },
  profileViewerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileViewerUsername: {
    fontSize: 16,
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  profileViewerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  profileViewerStat: {
    alignItems: 'center',
  },
  profileViewerStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  profileViewerStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profileViewerModeratorBadge: {
    backgroundColor: 'rgba(156,39,176,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileViewerModeratorText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileViewerBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  profileViewerJoined: {
    marginTop: 8,
  },
  profileViewerJoinedText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  profileViewerError: {
    fontSize: 16,
    color: COLORS.textSecondary,
    padding: 20,
  },
  chatsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatsHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  chatsHeaderSpacer: {
    width: 40,
  },
  chatsTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshChatsButton: {
    padding: 8,
  },
  refreshChatsButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  chatItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(33,33,33,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  groupChatAvatar: {
    backgroundColor: 'rgba(245,124,0,0.9)',
  },
  chatAvatarText: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  chatLastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatParticipants: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  chatExpiry: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noChatsIcon: {
    fontSize: 64,
    marginBottom: 20,
    color: COLORS.primary,
  },
  noChatsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  noChatsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  backToEventsButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 15,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  backToEventsButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatsList: {
    padding: 15,
  },
  noChatsScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  chatScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backToChatsButton: {
    padding: 8,
    marginRight: 10,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  chatHeaderEvent: {
    fontSize: 12,
    color: COLORS.textPrimary,
    opacity: 0.9,
    marginTop: 2,
  },
  participantsCountButton: {
    padding: 2,
  },
  chatOptionsMenu: {
    marginLeft: 5,
  },
  chatContentContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesFlatList: {
    flex: 1,
    paddingBottom: 10,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,167,38,0.95)',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomLeftRadius: 4,
  },
  systemMessageWrapper: {
    alignSelf: 'center',
    maxWidth: '95%',
    marginBottom: 10,
  },
  systemMessageContainer: {
    backgroundColor: 'rgba(224,224,224,0.9)',
    padding: 10,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  systemMessageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  senderNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  moderatorBadge: {
    color: COLORS.moderator,
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  myMessageText: {
    color: COLORS.textPrimary,
  },
  otherMessageText: {
    color: COLORS.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: COLORS.textPrimary,
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  readByText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageTapText: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
  },
  imageErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  imageErrorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  imageLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  messageInputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 20 : 50,
    paddingHorizontal: 10,
    zIndex: 100,
  },
  messageInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  sendButton: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  sendButtonText: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  photoButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageViewerContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  imageViewerCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imageViewerCloseText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageViewerResetButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imageViewerResetText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
  imageViewerLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  imageViewerLoadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  imageViewerHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileScrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  profileHeaderSpacer: {
    width: 40,
  },
  profileTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  profileAvatarOverlayText: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileUsername: {
    fontSize: 16,
    color: COLORS.primaryDark,
    marginBottom: 4,
    fontWeight: '500',
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  editProfileButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileEditAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileEditAvatar: {
    position: 'relative',
  },
  profileEditAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEditAvatarOverlayText: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  profileEditAvatarHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 20,
    fontSize: 16,
  },
  loadingMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMessagesIcon: {
    fontSize: 64,
    marginBottom: 20,
    color: COLORS.primary,
  },
  noMessagesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  noMessagesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  noEventsCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  noEventsIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: COLORS.primary,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createFirstButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  createFirstButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingBottom: 100,
  },
  noProfileText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  retryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveProfileButtonDisabled: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  saveProfileButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  createChatButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  createChatButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeSection: {
    marginBottom: 20,
  },
  codeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  codeSectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  codeDisplayContainer: {
    backgroundColor: 'rgba(255,167,38,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  codeDisplayLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  codeDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeTimer: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontWeight: '500',
  },
  codeHint: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  generateCodeButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  generateCodeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  codeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  codeDividerText: {
    paddingHorizontal: 15,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingVertical: 15,
  },
  joinCodeButton: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  joinCodeButtonDisabled: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  joinCodeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    margin: 20,
    padding: 20,
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },
  modalScrollContent: {
    maxHeight: height * 0.7,
  },
  modalBottomSpacer: {
    height: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.9)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    color: COLORS.textPrimary,
  },
  modalHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 5,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  picker: {
    height: 70,
    color: COLORS.textPrimary,
  },
  locationButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  locationButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  locationModalHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 15,
  },
  locationModalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  confirmLocationButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationMap: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    padding: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
  },
  locationInfoText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  locationCoordinates: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  createEventButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  createEventButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateEventButton: {
    backgroundColor: 'rgba(255,179,0,0.9)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  updateEventButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  infoNote: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  infoNoteText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: 'rgba(117,117,117,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  cancelModalButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmModalButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmModalButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicationsModalHeader: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 15,
  },
  applicationsModalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  myEventsList: {
    flex: 1,
    padding: 15,
  },
  myEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  noEventsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
  myEventCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  myEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  myEventDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  eventStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.9)',
  },
  activeEventBadge: {
    backgroundColor: 'rgba(255,179,0,0.9)',
  },
  completedEventBadge: {
    backgroundColor: 'rgba(56,142,60,0.9)',
  },
  pastEventBadge: {
    backgroundColor: 'rgba(117,117,117,0.9)',
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  myEventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.9)',
  },
  myEventEditButton: {
    backgroundColor: 'rgba(255,179,0,0.9)',
    borderRadius: 14,
    padding: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  myEventEditButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  myEventDeleteButton: {
    backgroundColor: 'rgba(211,47,47,0.9)',
    borderRadius: 14,
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  myEventDeleteButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  myEventApplicationsButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  myEventApplicationsButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  applicationsList: {
    flex: 1,
    padding: 15,
  },
  eventInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  eventInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  eventInfoDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  chatInfo: {
    fontSize: 13,
    color: COLORS.primaryDark,
    marginTop: 4,
    fontStyle: 'italic',
  },
  applicationsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  noApplicationsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
  applicationCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applicationUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  applicationUserRating: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: 'rgba(255,179,0,0.9)',
    borderRadius: 14,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  acceptButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: 'rgba(211,47,47,0.9)',
    borderRadius: 14,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  rejectButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'rgba(211,47,47,0.9)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  removeButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  viewProfileButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  blockUserButton: {
    backgroundColor: 'rgba(33,33,33,0.9)',
    borderRadius: 14,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  blockUserButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  reportOption: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    flex: 1,
    minWidth: '45%',
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  reportOptionActive: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    borderColor: COLORS.primaryDark,
  },
  reportOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sendReportButton: {
    backgroundColor: 'rgba(211,47,47,0.9)',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  sendReportButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  timestampInfo: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 10,
  },
  profileInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.9)',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  legalSection: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  legalButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  legalButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNavigation: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
    flexDirection: 'row',
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,224,178,0.9)',
    borderRadius: 10,
  },
  navIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  navIconActive: {
    color: COLORS.textPrimary,
  },
  navText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  navTextActive: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  navBadge: {
    position: 'absolute',
    top: 10,
    right: '30%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 120,
  },
  androidNavArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionDotConnected: {
    backgroundColor: '#4CAF50',
  },
  connectionDotDisconnected: {
    backgroundColor: '#FFC107',
  },
  connectionDotError: {
    backgroundColor: '#F44336',
  },
  connectionStatusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  chatHeaderSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  imagePickerButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  eventImagePreviewContainer: {
    position: 'relative',
    marginBottom: 15,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  eventImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 14,
  },
  removeEventImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeEventImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCardWithImage: {
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  eventCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  eventCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  eventCardContent: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  eventCardContentWithImage: {
    padding: 16,
  },
  eventTitleLight: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  eventTextLight: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  eventTimeInfoLight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageLoadingBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  chatParticipantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  chatParticipantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatParticipantName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginLeft: 12,
  },
  chatParticipantBadge: {
    fontSize: 12,
    color: COLORS.moderator,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chatParticipantAdminBadge: {
    backgroundColor: 'rgba(255,167,38,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  chatParticipantAdminText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  chatParticipantRemoveButton: {
    padding: 8,
    backgroundColor: 'rgba(211,47,47,0.9)',
    borderRadius: 12,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatParticipantRemoveText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  participantsModalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    margin: 20,
    padding: 20,
    maxHeight: height * 0.8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },
  participantsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  chatParticipantEmpty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 30,
    fontSize: 16,
    fontStyle: 'italic',
  },
  datePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  datePickerButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  adBannerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    zIndex: 998,
  },
  adBanner: {
    width: 320,
    height: 50,
  },
});

// Тексты юридических документов
const PRIVACY_POLICY_TEXT = `**ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ**

**Политика конфиденциальности приложения "DOT"**

**Последнее обновление:** 08.02.2026

**1. Сбор информации**

Приложение "DOT" собирает следующую информацию:

- **Основные данные:** имя пользователя, email, фото профиля
- **Контент:** созданные события, сообщения в чатах, отзывы
- **Геоданные:** местоположение для отображения событий на карте
- **Технические данные:** IP-адрес, тип устройства, версия ОС

**2. Использование информации**

Собранная информация используется для:
- Создания и управления вашим аккаунтом
- Отображения событий на карте Москвы
- Организации групповых чатов
- Обеспечения связи между участников событий
- Улучшения работы приложения

**3. Хранение данных**
- Данные хранятся на защищенных серверах Supabase (ЕС)
- Геоданные используются только для отображения на карте
- Сообщения в чатах хранятся 30 дней после окончания события
- Вы можете удалить свой аккаунт в любое время

**4. Безопасность**
- Используется шифрование передаваемых данных
- Доступ к персональным данным имеют только вы
- Регулярные проверки безопасности системы

**5. Контакты**
По вопросам конфиденциальности:
Email: famrop01@gmail.com`;

const TERMS_OF_USE_TEXT = `**УСЛОВИЯ ИСПОЛЬЗОВАНИЯ**

**Условия использования приложения "DOT"**

**1. Общие положения**

1.1. Используя приложение "DOT", вы соглашаетесь с этими условиями
1.2. Приложение предназначено для лиц старше 18 лет
1.3. Вы несете ответственность за весь контент, который публикуете

**2. Правила поведения**

Запрещается:
2.1. Создавать мошеннические события
2.2. Оскорблять других пользователей
2.3. Размещать незаконный контент
2.4. Использовать приложение для спама
2.5. Предлагать запрещенные услуги

**3. Платные услуги**

3.1. Для событий типа "Помощь" можно устанавливать цену
3.2. Приложение не участвует в денежных расчетах
3.3. Все финансовые вопросы решаются напрямую между пользователями
3.4. Приложение не несет ответственности за невыполненные денежные обязательства

**4. Ответственность**

4.1. Организаторы событий несут ответственность за безопасность участников
4.2. Участие в событиях на свой страх и риск
4.3. Рекомендуется встречаться в публичных местах
4.4. Сообщайте о подозрительных пользователях через функцию "Пожаловаться"

**5. Изменения**

5.1. Условия могут меняться без предварительного уведомления
5.2. Продолжение использования приложения означает согласие с новыми условиями`;