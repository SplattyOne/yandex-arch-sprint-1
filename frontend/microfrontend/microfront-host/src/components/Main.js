import React from 'react';
import { lazy, Suspense }  from "react";
import { CurrentUserContext } from '../contexts/CurrentUserContext';

const Card = lazy(() => import('cards/Card').catch(() => {
  return { default: () => <div className='error'>Компонент не загружен, обратитесь к администратору приложения.</div> };
 })
);

function Main({ cards, onEditProfile, onAddPlace, onEditAvatar, onCardClick, onCardLike, onCardDelete }) {
  const currentUser = React.useContext(CurrentUserContext);

  const imageStyle = { backgroundImage: `url(${currentUser.avatar})` };

  return (
    <main className="content">
      <section className="profile page__section">
        <div className="profile__image" onClick={onEditAvatar} style={imageStyle}></div>
        <div className="profile__info">
          <h1 className="profile__title">{currentUser.name}</h1>
          <button className="profile__edit-button" type="button" onClick={onEditProfile}></button>
          <p className="profile__description">{currentUser.about}</p>
        </div>
        <button className="profile__add-button" type="button" onClick={onAddPlace}></button>
      </section>
      <section className="places page__section">
        <ul className="places__list">
          {cards.map((card) => (
            <Suspense fallback={<div>Загрузка...</div>}>
              <Card
                key={card._id}
                card={card}
                onCardClick={onCardClick}
                onCardLike={onCardLike}
                onCardDelete={onCardDelete}
                currentUser={currentUser}
              />
            </Suspense>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Main;
