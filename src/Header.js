import React from "react";
import styles from "./Header.module.css";
import { ReactComponent as Reload } from "./reload.svg";

function Header(props) {
  return (
    <header className={styles.Header}>
      <div></div>
      <h1 className={styles.Heading}>Linda from Purcha$ing v18</h1>
      <button className={styles.ReloadButton} onClick={props.onReloadClick}>
        <Reload className={styles.ReloadIcon} />
      </button>
    </header>
  );
}

export default Header;
