import React from 'react';
import styles from './Header.module.css';
import { ReactComponent as Reload } from './reload.svg';
import { ReactComponent as Title } from './title.svg';

function Header(props) {
  return (
    <header className={styles.Header}>
      <div></div>
      <div className={styles.TitleContainer}>
        <h1 className={styles.Heading}>{props.title}</h1>
        <Title className={styles.TitleImage} />
      </div>

      <button className={styles.ReloadButton} onClick={props.onReloadClick}>
        <Reload className={styles.ReloadIcon} />
      </button>
    </header>
  );
}

export default Header;
