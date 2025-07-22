import styles from "./Header.module.css"
import type { FC } from "react"

/**
 * Header.tsx
 *
 * Application header component. Displays the app title, tagline, and theme (dark/light) toggle buttons.
 */
/**
 * Header component for the MathMex app.
 *
 * Displays the app title, tagline, and theme toggle buttons for dark/light mode.
 *
 * @returns {JSX.Element} The rendered header.
 */
const Header: FC<{  }> = ({  }) => {

    return (
        <header className={styles.header}>
            {/* Search history button on the left */}
            <div className="container">
                <div className={styles.headerContent}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.title}>
                            PDF Reader
                        </h1>
                        <p className={styles.tagline}>Powered by <a href="https://mathmex.com">MathMex</a></p>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header