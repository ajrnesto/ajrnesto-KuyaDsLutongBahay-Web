import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { parseButtonAction, parseDate, parseTime, capitalizeFirstLetter, showModal, titleCase } from '../js/utils.js';

// chips
const btnPendingLabel = document.querySelector("#btnPendingLabel");
const btnConfirmedLabel = document.querySelector("#btnConfirmedLabel");
const btnPreparingLabel = document.querySelector("#btnPreparingLabel");
const btnInTransitLabel = document.querySelector("#btnInTransitLabel");
const btnCompletedLabel = document.querySelector("#btnCompletedLabel");

// toast
const toastContentBooking = document.querySelector("#toastContentBooking");
const toastBooking = document.querySelector("#toastBooking");

const bookingsContainer = document.querySelector("#bookingsContainer");

// chat
const divChatContainer = document.querySelector("#divChatContainer");
const tvChatTitle = document.querySelector("#tvChatTitle");

onAuthStateChanged(auth, user => {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;

		if (userType == 3) {
			getBookingsData("In Transit");
		}
	});
});

window.addEventListener("load", function() {
	getBookingsData("Pending");
	btnPendingLabel.style.color = "white";
});

btnPendingLabel.addEventListener("click", function() {
	getBookingsData("Pending");
	btnPendingLabel.style.color = "white";
	btnConfirmedLabel.style.color = "#E13333";
	btnPreparingLabel.style.color = "#E13333";
	btnInTransitLabel.style.color = "#E13333";
	btnCompletedLabel.style.color = "#E13333";
});

btnConfirmedLabel.addEventListener("click", function() {
	getBookingsData("Confirmed");
	btnPendingLabel.style.color = "#E13333";
	btnConfirmedLabel.style.color = "white";
	btnPreparingLabel.style.color = "#E13333";
	btnInTransitLabel.style.color = "#E13333";
	btnCompletedLabel.style.color = "#E13333";
});


btnPreparingLabel.addEventListener("click", function() {
	getBookingsData("Preparing");
	btnPendingLabel.style.color = "#E13333";
	btnConfirmedLabel.style.color = "#E13333";
	btnPreparingLabel.style.color = "white";
	btnInTransitLabel.style.color = "#E13333";
	btnCompletedLabel.style.color = "#E13333";
});
btnInTransitLabel.addEventListener("click", function() {
	getBookingsData("In Transit");
	btnPendingLabel.style.color = "#E13333";
	btnConfirmedLabel.style.color = "#E13333";
	btnPreparingLabel.style.color = "#E13333";
	btnInTransitLabel.style.color = "white";
	btnCompletedLabel.style.color = "#E13333";
});

btnCompletedLabel.addEventListener("click", function() {
	getBookingsData("Completed");
	btnPendingLabel.style.color = "#E13333";
	btnConfirmedLabel.style.color = "#E13333";
	btnPreparingLabel.style.color = "#E13333";
	btnInTransitLabel.style.color = "#E13333";
	btnCompletedLabel.style.color = "white";
});

function getBookingsData(filterStatus) {
	let qryBookings = null;

	if (filterStatus == "Completed") {
		qryBookings = query(collection(db, "bookings"), where("status", "==", filterStatus), orderBy("timestamp", "asc"));
	}
	else {
		qryBookings = query(collection(db, "bookings"), where("status", "==", filterStatus), orderBy("timestamp", "desc"));
	}
	
	onSnapshot(qryBookings, (bookings) => {
		// clear table
		bookingsContainer.innerHTML = '';

		console.log("Bookings size: "+bookings.size);
		if (bookings.size == 0) {
			bookingsContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Bookings to Display</h4></div>';
		}
		else {
			bookingsContainer.innerHTML = '';
		}
			
		bookings.forEach(order => {
			renderOrderCard(
				order.id,
				order.data().customerUid,
				order.data().firstName,
				order.data().lastName,
				order.data().mobile,
				order.data().eventType,
				order.data().headcount,
				order.data().bundleSize,
				order.data().dishes,
				order.data().purok,
				order.data().barangay,
				order.data().eventDate,
				order.data().eventTime,
				order.data().status,
				order.data().timestamp,
				order.data().total
			);
		});
	});
}

function renderOrderCard(id, customerUid, firstName, lastName, mobile, eventType, headcount, bundleSize, dishes, purok, barangay, eventDate, eventTime, status, timestamp, total) {
    const cardContainer = document.createElement('div');
    	const card = document.createElement('div');
    		const cardHeader = document.createElement('div');
    			const tvTimestamp = document.createElement('p');
    			const tvStatus = document.createElement('h6');
    			const divButtonContainer = document.createElement('div');
					const btnChat = document.createElement('button');
					const btnAction = document.createElement('button');
					const btnSecondaryAction = document.createElement('button');
					const tvCustomer = document.createElement('h6');
					const tvEventType = document.createElement('p');
    			const tvBundleSize = document.createElement('p');
    			const tvHeadcount = document.createElement('p');
    			const tvVenue = document.createElement('p');
    			const tvEventDate = document.createElement('p');
			const cardBody = document.createElement('div');
				const table = document.createElement('table');
					const thead = document.createElement('thead');
						const tr = document.createElement('tr');
							const thImage = document.createElement('th');
							const thMenuItem = document.createElement('th');
					const tbody = document.createElement('tbody');
			const cardFooter = document.createElement('div');
				const tvTotal = document.createElement('h6');

	cardContainer.className = "row container mx-auto col-12 p-4 justify-content-center";
	card.className = "rounded bg-white col-6 text-center p-4";
	cardHeader.className = "row";
	tvTimestamp.className = "col-6 text-start text-dark fs-6";
	tvStatus.className = "col-6 text-end text-danger fs-6";
	divButtonContainer.className = "col-12 text-end p-0";
	btnAction.className = "btn btn-primary m-0";
	btnChat.classList = "btn btn-primary float-start me-2";
	btnSecondaryAction.className = "ms-2 btn btn-danger text-white";
	tvCustomer.className = "text-primary text-start my-0 py-0";
	tvEventType.className = "text-dark text-start my-0 py-0";
	tvBundleSize.className = "text-dark text-start my-0 py-0 d-none";
	tvHeadcount.className = "text-dark text-start my-0 py-0";
	tvVenue.className = "text-dark text-start my-0 py-0";
	tvEventDate.className = "text-dark text-start my-0 py-0";
	cardBody.className = "row mt-3";
	table.className = "col-6 table align-middle";
	thImage.className = "col-1 invisible text-end";
	thMenuItem.className = "col-auto text-start";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end mt-2";

	thMenuItem.innerHTML = "Selected Items";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;

	const btnActionValue = parseButtonAction(status);
	if (btnActionValue == -1) {
		btnAction.className = "invisible";
	}
	else {
		btnAction.innerHTML = btnActionValue;
	}
	btnAction.onclick = function() { updateOrderStatus(id, firstName, lastName, status, total) }

	if (status == "In Transit"){
		btnSecondaryAction.innerHTML = "Failed To Deliver";
	}
	else {
		btnSecondaryAction.className = "invisible";
	}
	btnChat.onclick = function() { chat(customerUid) }
	
	tvTotal.innerHTML = "Total: ₱"+Number(total * headcount).toFixed(2);

	tvCustomer.innerHTML = firstName + " " + lastName + " (" + mobile + ")";
	tvEventType.innerHTML = "Event Type: " + capitalizeFirstLetter(eventType);
	tvBundleSize.innerHTML = "Bundle Size: " + bundleSize + " Dishes";
	tvHeadcount.innerHTML = "Headcount: " + headcount + " Persons";
	tvVenue.innerHTML = purok + ", " + barangay + ", Siaton";
	if (eventTime) {
		tvEventDate.innerHTML = "Event Date: " + parseDate(eventDate) + ", " + parseTime(eventTime);
	}
	else {
		tvEventDate.innerHTML = "Event Date: " + parseDate(eventDate);
	}
	btnChat.innerHTML = "<i class=\"bi bi-chat-dots-fill me-2 text-white fs-6\"></i>Chat";

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			cardHeader.appendChild(tvCustomer);
			cardHeader.appendChild(tvEventType);
			cardHeader.appendChild(tvBundleSize);
			cardHeader.appendChild(tvHeadcount);
			cardHeader.appendChild(tvVenue);
			cardHeader.appendChild(tvEventDate);
		card.appendChild(cardBody);
			card.appendChild(table);
				table.appendChild(thead);
					thead.appendChild(tr);
						tr.appendChild(thImage);
						tr.appendChild(thMenuItem);
						//tr.appendChild(thDetails);
				table.appendChild(tbody);
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);
			cardFooter.appendChild(divButtonContainer);
				divButtonContainer.appendChild(btnChat);
				divButtonContainer.appendChild(btnAction);
				// divButtonContainer.appendChild(btnSecondaryAction);
			// cardHeader.appendChild(tvDeliveryAddress);

	bookingsContainer.prepend(cardContainer);

	getOrderItemsData(id, dishes, tbody);
}

function chat(userUid) {
	showModal('#modalChat');

	const refPatientName = doc(db, "users", userUid);

	getDoc(refPatientName).then((patient) => {
		tvChatTitle.innerHTML = titleCase(patient.data().firstName + " " + patient.data().lastName);
	});

	const qryChat = query(collection(db, "chats", userUid, "chats"), orderBy("timestamp", "asc"));

	onSnapshot(qryChat, (docSnapshots) => {
		divChatContainer.innerHTML = "";

		docSnapshots.forEach((chat) => {
			const chatBubble = document.createElement("div");
			const chatMessage = document.createElement("span");

			chatMessage.innerHTML = chat.data().message;

			chatBubble.className = "col-12 py-2";
			chatMessage.className = "rounded p-2";

			// if currently signed in user is the author of this message:
			if (chat.data().authorUid == getAuth().currentUser.uid) {
				chatBubble.classList.toggle("text-end", true);
				chatMessage.classList.toggle("bg-primary", true);
				chatMessage.classList.toggle("text-white", true);
			}
			else {
				chatBubble.classList.toggle("text-start", true);
				chatMessage.classList.toggle("bg-secondary", true);
				chatMessage.classList.toggle("text-dark", true);
			}

			chatBubble.append(chatMessage);
			divChatContainer.append(chatBubble);
		});

		divModalBody.scrollTo(0, divModalBody.scrollHeight);
	});
	
	btnSend.onclick = function() {
		const refNewChat = doc(collection(db, "chats", userUid, "chats"));

		const newChatData = {
			id: refNewChat.id,
			authorUid: getAuth().currentUser.uid,
			message: etChatBox.value,
			timestamp: Date.now()
		}

		setDoc(refNewChat, newChatData);
		etChatBox.value = "";
		etChatBox.style.height = "1px";
	}
}

function updateOrderStatus(orderId, firstName, lastName, status, deliveryOption, total) {
	bootstrap.Toast.getOrCreateInstance(toastBooking).show();
	if (status == "Pending") {
		toastContentBooking.innerHTML = titleCase(firstName + " " + lastName)+ "'s booking has been accepted.";
		updateDoc(doc(db, "bookings", orderId), {
			status: "Confirmed"
		});
	}
	else if (status == "Confirmed") {
		toastContentBooking.innerHTML = "Preparing " + titleCase(firstName + " " + lastName)+ "'s booking.";
		updateDoc(doc(db, "bookings", orderId), {
			status: "Preparing"
		});
	}
	else if (status == "Preparing") {
		toastContentBooking.innerHTML = titleCase(firstName + " " + lastName) + "'s booking is now in transit.";
		updateDoc(doc(db, "bookings", orderId), {
			status: "In Transit"
		});
	}
	else if (status == "In Transit") {
		toastContentBooking.innerHTML = titleCase(firstName + " " + lastName) + "'s booking has been completed.";
		updateDoc(doc(db, "bookings", orderId), {
			status: "Completed"
		});
	}
21
	getBookingsData(status);
}

async function getOrderItemsData(orderId, dishes, tbody) {
	dishes.forEach((dish) => {
		// if (!product.exists()) {
		// 	renderOrderItems(
		// 		tbody,
		// 		"-1",
		// 		"Deleted Item",
		// 		"Deleted Item",
		// 		0,
		// 		0,
		// 		null
		// 	);

		// 	return;
		// }

		renderOrderItems(
			tbody,
			dish.id,
			dish.productName,
			dish.thumbnail,
			dish.categoryId
		);
	});
}

function renderOrderItems(tbody, productId, productName, thumbnail, categoryId) {
	const newRow = document.createElement('tr');
	const cellMenuItemThumbnail = document.createElement('td');
		const imgThumbnail = document.createElement('img');
	const cellMenuItemName = document.createElement('td');
	const cellUnitPrice = document.createElement('td');
	const cellQuantity = document.createElement('td');
	const cellSubtotal = document.createElement('td');

	if (thumbnail == null){
		imgThumbnail.src = "https://via.placeholder.com/150?text=No+Image";
	}
	else {
		getDownloadURL(ref(storage, 'products/'+thumbnail))
			.then((url) => {
				imgThumbnail.src = url;
			});
	}
	cellMenuItemThumbnail.className = "text-end";
	imgThumbnail.className = "col-12 rounded";
	imgThumbnail.style.width = "50px";
	imgThumbnail.style.height = "50px";
	imgThumbnail.style.objectFit = "cover";

	cellMenuItemName.innerHTML = productName;
	cellMenuItemName.className = "text-start";

	newRow.appendChild(cellMenuItemThumbnail);
		cellMenuItemThumbnail.appendChild(imgThumbnail);
	newRow.appendChild(cellMenuItemName);

	tbody.append(newRow);
}