# 你好! 안녕! やあ!
# 👋 Welcome to the Language Learning Project!

This is an educational and interactive web application designed to help you practice writing characters from different languages. It offers a dynamic way to learn stroke order and sentence formatting, all within a modern and responsive interface. **Specifically, for Hanzi, Kanji, and Hangul, the application will display the stroke order for each character within dedicated input boxes, guiding you through the correct writing sequence.**

---

## ✨ Main Features

* **Interactive Practice Modules:** Dive into writing exercises for various writing systems, featuring real-time stroke order animations.
* **Character-Specific Stroke Guides:** For Chinese (Hanzi), Japanese (Kanji), and Korean (Hangul), the application will break down each character into individual boxes, showing the precise stroke order for effective learning.
* **Intuitive Interface:** Enjoy a smooth and user-friendly experience, designed to maximize your learning.
* **Version Control:** The project uses **Git** and is hosted on **GitHub** for collaborative development and clear change history.
* **Responsive Design:** The interface is built with a **responsive** approach, ensuring an optimal experience on any device (desktop, tablet, and mobile).

---

## 🛠️ Technologies Used

* **HTML5** – For the fundamental page structure.
* **CSS3** – For styling, including advanced properties and media queries for responsiveness.
* **JavaScript** – For application logic and interactivity.
* **[CSS/UI Framework Name]** (e.g., Bootstrap 5, Tailwind CSS) – A CSS framework for layout and design.
* **[Character Library Name]** (e.g., Hanzi-Writer.js, p5.js for canvas) – Specific libraries for stroke animation or canvas interaction.

---

## 📂 Project Structure
```
AsianLanguagesv2/
├── scss/
│   ├── base/
│   │   ├── _reset.scss
│   │   └── _typography.scss
│   ├── components/
│   │   ├── _buttons.scss
│   │   ├── _cards.scss
│   │   ├── _footer.scss
│   │   └── _header.scss
│   ├── layout/
│   │   └── _grid.scss
│   ├── pages/
│   │   └── _home.scss
│   ├── utils/
│   │   └── _variables.scss
│   └── style.scss
├── css/
│   └── style.css
├── js/
│   ├── hangul.js
│   ├── index.js
│   └── japanese.js
├── assets/
│   └── images/
│       └── Imgs/
│           ├── Xicon.png
│           ├── discordicon.png
│           ├── fbicon.png
│           └── liicon.png
├── .gitignore
├── README.md
├── aboutus.html
├── hangul.html
├── hanzi.html
├── index.html
└── japanese.html
```

---

## 🤝 Contributions

This project is in its early development stages. Your contributions are welcome to improve functionality and design!

If you have ideas, find bugs, or want to collaborate, feel free to:

1.  `Fork` the repository.
2.  Create a new `branch` (`git checkout -b feature/AmazingFeature`).
3.  Make your changes and `commit` (`git commit -m 'Add some AmazingFeature'`).
4.  Push your changes (`git push origin feature/AmazingFeature`).
5.  Open a `Pull Request`.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

© 2025 David Gerena. All rights reserved.

---

## 🧪 Preview branch for PDF download testing

This branch is intended to test worksheet PDF downloads without publishing to `asian-languages.com`.

### GitHub Codespaces / online port preview

1. Open the repository in GitHub Codespaces.
2. Run:
   ```bash
   npm run preview
   ```
3. Codespaces will forward port `3000`. Open the forwarded URL and test:
   * `/hanzi.html`
   * `/hangul.html`
   * `/japanese.html`
4. Type sample characters and click **Download PDF**. The download is generated in the browser, so it does not require deploying the production domain.

### Firebase Hosting emulator preview

If you want to test the Firebase Hosting layout without deploying production, run:

```bash
npm run emulators:hosting
```

Then open the forwarded port `5000` in Codespaces. The hosting emulator serves the `public/` folder configured in `firebase.json`.

### Static validation

Run this check before testing manually:

```bash
npm run validate:html
```

It verifies that Hanzi, Hangul, and Japanese pages load `html2canvas`, `jsPDF`, and the shared PDF helper before each page script.
