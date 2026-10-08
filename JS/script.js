import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Sign out the newly created account
await signOut(auth);

// Clear any previous student's local data
localStorage.removeItem("student");


const form = document.getElementById("signupForm");
const registerBtn = document.getElementById("register-Btn");


const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
let redirectPage = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;
startLoading();

  const fullName = document.getElementById("fullName").value.trim();
  const matricNumber = document.getElementById("matric").value.trim();
  const department = document.getElementById("department").value;
  const level = document.getElementById("level").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;


  try {
    // STEP 1: Check if matric number already exists
    const q = query(
      collection(db, "students"),
      where("matricNumber", "==", matricNumber)
    );

    const checkMatric = await getDocs(q);

    if (!checkMatric.empty) {
      showPopup("Matric number already registered", "error");
      return;
    }

    // STEP 2: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

console.log("NEW STUDENT CREATED");
console.log("New student UID:", user.uid);
console.log("New student email:", user.email);

    // STEP 3: Save student in Firestore
    await setDoc(doc(db, "students", user.uid), {
      fullName,
      matricNumber,
      department,
      level,
      email,
      role: "student",
      status: "active",
      createdAt: new Date()
    });

    // STEP 4: Success
    form.reset();

   showPopup(
    "Registration successful",
    "success",
    "login.html"
);

  } catch (error) {
    showPopup(error.message, "error");
  } finally{
    stopLoading();
  }


});



function startLoading() {
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";
}

function stopLoading() {
    registerBtn.disabled = false;
    registerBtn.textContent = "Register";
}


function showPopup(message, type, redirect = "") {

    redirectPage = redirect;

    popup.style.display = "block";

    popupMessage.textContent = message;

    popupTitle.textContent =
        type === "success" ? "Success" : "Error";
}




window.closePopup = function () {

    popup.style.display = "none";

    if (redirectPage !== "") {

        const page = redirectPage;
        redirectPage = "";

        window.location.href = page;
    }
};


function validateForm() {
  const fullName = document.getElementById("fullName").value.trim();
  const matricNo = document.getElementById("matric").value.trim();
  const department = document.getElementById("department").value;
  const level = document.getElementById("level").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // const pop = document.getElementById("popup");
  const check = document.getElementById("passChecker");


  if (fullName === "" || !isNaN(fullName)) {
    showPopup("Incorrect input, please check your details.", "error");
return false;
  }

  
  if (matricNo === "") {
   showPopup("Incorrect input, please check your details.", "error");
return false;
  }

  
  if (department === "") {
  showPopup("Incorrect input, please check your details.", "error");
return false;
  }


  if (level === "") {
 showPopup("Incorrect input, please check your details.", "error");
return false;
  }

 
  if (email === "") {
   showPopup("Incorrect input, please check your details.", "error");
return false;
  }

 
  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
  showPopup("Incorrect input, please check your details.", "error");
return false;
  }

 
  if (password.length < 6) {
    check.textContent = "Password must be at least 6 characters";
    check.style.color = "red";
    check.style.marginLeft="100px";
    return false;
  }

  return true;
}

// import { auth, db } from "./firebase-config.js";
// import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

//   form.addEventListener("submit", async (e) => {
//   e.preventDefault();


//   function validateForm() {
//     const fullName = document.getElementById("fullName").value.trim();
//         const matricNo = document.getElementById("matric").value.trim();
//         const department = document.getElementById("department").value;
//         const level = document.getElementById("level").value;
//         const email = document.getElementById("email").value.trim();
//         const password= document.getElementById("password").value;
//         const pop =document.getElementById("popup")
//         const check = document.getElementById("check")
//         const passChecker=document.getElementById("passChecker")

    


//          if (fullName==="" || !isNaN(fullName)) {
//             pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;
//          }

//          if (matricNo==="") {
//            pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;           
//          }
         
//          if (department==="") {
//           pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;         
//          }
//            if (level==="") {
//          pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;         
//          }

//            if (email==="") {
//           pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;         
//          }
        
//          let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//        pop.textContent = "Incorrect input please check your details"
//             pop.style.display="block";
//             return false;
//     }
          
//     if (password.length < 6 ||password==="") {
//          check.textContent = "Password at least 6 characters"
//          check.style.color="red";
//          check.style.marginLeft="100px"
//             return false;           
//          }
         
     
//   if (!validateForm()) return;
   
//   }
// });