import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const form =
    document.getElementById("adminSetupForm");

const message =
    document.getElementById("message");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const fullName =
        document.getElementById("adminName")
        .value
        .trim();

    const email =
        document.getElementById("adminEmail")
        .value
        .trim();

    const password =
        document.getElementById("adminPassword")
        .value;


    try {

        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Create Admin Firestore document
        await setDoc(
            doc(db, "admins", user.uid),
            {
                fullName: fullName,
                email: email,
                role: "admin",
                createdAt: new Date()
            }
        );


        message.textContent =
            "Admin account created successfully.";

        message.style.color = "green";


        form.reset();


        console.log(
            "Admin UID:",
            user.uid
        );


    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );

        message.textContent =
            error.message;

        message.style.color = "red";

    }

});