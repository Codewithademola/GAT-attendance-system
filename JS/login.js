import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
console.log("login.js loaded");

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("login-Btn");
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const popupEmail = document.getElementById("popupEmail");
const popupActionBtn = document.getElementById("popupActionBtn");
const popupCloseBtn = document.getElementById("popupCloseBtn");
const forgotPassword = document.getElementById("forgotPassword");
console.log("form:", form);

let redirectPage = "";


form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    startLoading();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

try {

    console.log("1. Attempting login...");

    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    console.log("2. Login successful");

    const user = userCredential.user;

    // Check lecturer
    const lecturerRef = doc(db, "lecturers", user.uid);
    const lecturerSnap = await getDoc(lecturerRef);

    if (lecturerSnap.exists()) {

        localStorage.setItem(
            "lecturer",
            JSON.stringify(lecturerSnap.data())
        );

        showPopup(
            "Lecturer login successful",
            "success",
            "lecturer-dashboard.html"
        );

        return;
    }



// Check admin
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {

    localStorage.setItem(
        "admin",
        JSON.stringify(adminSnap.data())
    );

    showPopup(
        "Admin login successful",
        "success",
        "admin.html"
    );

    return;
}



    // Check student
    const studentRef = doc(db, "students", user.uid);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {

        localStorage.setItem(
            "student",
            JSON.stringify(studentSnap.data())
        );

        showPopup(
            "Student login successful",
            "success",
            "student-dashboard.html"
        );

        return;
    }

    // User authenticated but not found in either collection
    showPopup(
        "Account record not found.",
        "error"
    );

} catch (error) {

    console.error(error);

    if (error.code === "auth/invalid-credential") {

        showPopup("Invalid email or password.", "error");

    } else {

        showPopup(error.message, "error");

    }

} finally {
    stopLoading();
}

});


forgotPassword.addEventListener("click", (e) => {

    e.preventDefault();

    popup.style.display = "block";

    popupTitle.textContent = "Reset Password";

    popupMessage.textContent =
        "Enter your registered email.";

    popupEmail.style.display = "block";

    popupActionBtn.style.display = "block";

    popupActionBtn.textContent = "Send Link";

    popupCloseBtn.textContent = "Cancel";

});



popupActionBtn.addEventListener("click", async () => {

    const email = popupEmail.value.trim();


    if (email === "") {

        popupMessage.textContent =
            "Please enter your email.";

        return;

    }


    try {

        await sendPasswordResetEmail(auth, email);


        closePopup();


        showPopup(
            "Password reset link sent. Check your email.",
            "success"
        );


    } catch(error) {


        if(error.code === "auth/user-not-found") {

            showPopup(
                "No account found with this email.",
                "error"
            );

        }

        else if(error.code === "auth/invalid-email") {

            showPopup(
                "Invalid email address.",
                "error"
            );

        }

        else {

            showPopup(
                error.message,
                "error"
            );

        }

    }

});



const loginText = document.getElementById("loginText");
const loginSpinner = document.getElementById("loginSpinner");


function startLoading() {

    loginBtn.disabled = true;

    loginText.textContent = "Logging in...";

    loginSpinner.style.display = "inline-block";

}


function stopLoading() {

    loginBtn.disabled = false;

    loginText.textContent = "Login";

    loginSpinner.style.display = "none";

}

function showPopup(message, type, redirect = "") {

    redirectPage = redirect;

    popup.style.display = "block";
    popup.className = "popup " + type;
    popupMessage.textContent = message;
    popupTitle.textContent =
    type === "success" ? "Success" : "Error";

}


function showResetPopup(){

    popup.style.display = "block";

    popupTitle.textContent = "Reset Password";

    popupMessage.textContent =
        "Enter your registered email.";

    popupEmail.style.display = "block";

    popupActionBtn.style.display = "block";

    popupActionBtn.textContent = "Send Link";

    popupCloseBtn.textContent = "Cancel";

}






window.closePopup = function () {

    popup.style.display = "none";


    // Reset forgot password fields
    if (popupEmail) {

        popupEmail.value = "";

        popupEmail.style.display = "none";

    }


    if (popupActionBtn) {

        popupActionBtn.style.display = "none";

    }


    if (popupCloseBtn) {

        popupCloseBtn.textContent = "OK";

    }


    // Handle redirect after success
    if (redirectPage !== "") {

        const page = redirectPage;

        redirectPage = "";

        window.location.href = page;

    }

};

function validateForm() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {

        showPopup("Please fill in all fields.", "error");
        return false;

    }

    return true;

}