import React from "react";
import { Route, useHistory, Switch, lazy, Suspense } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";


const Login = lazy(() => import('auth/Login').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const Register = lazy(() => import('auth/Register').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const authApi = lazy(() => import('auth/authApi').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);

const ImagePopup = lazy(() => import('cards/ImagePopup').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const AddPlacePopup = lazy(() => import('cards/AddPlacePopup').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const PopupWithForm = lazy(() => import('cards/PopupWithForm').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const cardsApi = lazy(() => import('cards/cardsApi').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);

const EditProfilePopup = lazy(() => import('profile/EditProfilePopup').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const EditAvatarPopup = lazy(() => import('profile/EditAvatarPopup').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);
const profileApi = lazy(() => import('profile/profileApi').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);


function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cards, setCards] = React.useState([]);

  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  // В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  function getAppInfo() {
    return Promise.all([cardsApi.getCardList(), profileApi.getUserInfo()]);
  }

  // Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
  React.useEffect(() => {
    getAppInfo()
      .then(([cardData, userData]) => {
        setCurrentUser(userData);
        setCards(cardData);
      })
      .catch((err) => console.log(err));
  }, []);

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      authApi
        .checkToken(token)
        .then((res) => {
          onLoginSuccess(res.data.email);
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.log(err);
        });
    }
  }, [history]);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoToolTipOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleUpdateUser(userUpdate) {
    profileApi
      .setUserInfo(userUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateAvatar(avatarUpdate) {
    profileApi
      .setUserAvatar(avatarUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    cardsApi
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    cardsApi
      .removeCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((c) => c._id !== card._id));
      })
      .catch((err) => console.log(err));
  }

  function handleAddPlaceSubmit(newCard) {
    cardsApi
      .addCard(newCard)
      .then((newCardFull) => {
        setCards([newCardFull, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function onRegister({ email, password }) {
    authApi
      .register(email, password)
      .then((res) => {
        setTooltipStatus("success");
        setIsInfoToolTipOpen(true);
        history.push("/signin");
      })
      .catch((err) => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  function onLogin({ email, password }) {
    authApi
      .login(email, password)
      .then((res) => {
        setIsLoggedIn(true);
        setEmail(email);
        history.push("/");
      })
      .catch((err) => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }

  return (
    // В компонент App внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
            loggedIn={isLoggedIn}
          />
          <Route path="/signup">
            <Suspense fallback={<div>Загрузка...</div>}>
              <Register onRegister={onRegister} />
            </Suspense>
          </Route>
          <Route path="/signin">
            <Suspense fallback={<div>Загрузка...</div>}>
              <Login onLogin={onLogin} />
            </Suspense>
          </Route>
        </Switch>
        <Footer />
        <Suspense fallback={<div>Загрузка...</div>}>
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onUpdateUser={handleUpdateUser}
            onClose={closeAllPopups}
            currentUser={currentUser}
          />
        </Suspense>
        <Suspense fallback={<div>Загрузка...</div>}>
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onAddPlace={handleAddPlaceSubmit}
            onClose={closeAllPopups}
          />
        </Suspense>
        <Suspense fallback={<div>Загрузка...</div>}>
          <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
        </Suspense>
        <Suspense fallback={<div>Загрузка...</div>}>
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onUpdateAvatar={handleUpdateAvatar}
            onClose={closeAllPopups}
          />
        </Suspense>
        <Suspense fallback={<div>Загрузка...</div>}>
          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </Suspense>
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          status={tooltipStatus}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
