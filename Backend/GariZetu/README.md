# 🚗 GariZetu - Car Rental System

**GariZetu** is a modern car rental system built using Java and Spring Boot. It allows customers to browse available cars, make bookings, and manage rentals, while admins can add cars, manage bookings, and monitor availability.

---

## 📦 Features

- 🔍 Browse and search for cars by brand, type, availability, etc.
- 📸 View cars with image galleries (stored via URL).
- 📅 Book available cars and manage reservations.
- 👤 User roles: Admin & Customer.
- 📊 Dashboard for admins (booking history, availability stats).
- 🖼️ Image upload using cloud storage (e.g., Cloudinary/S3).
- 💳 Optional: M-Pesa payment integration.

---

## ⚙️ Tech Stack

- **Backend:** Java, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL 
- **Frontend:** React
- **Cloud:** Cloudinary
- **Auth:** Spring Security with JWT
- **Dev Tools:** Git, IntelliJ IDEA, Postman

---

## 🗃️ Database Tables Overview

### `Car`
- `id`, `make`, `model`, `year`, `color`, `pricePerDay`, `availability`

### `CarImage`
- `id`, `car_id`, `imageUrl`, `isPrimary`

### `Driver`
- `id`,`name`,`email`,`phone_number`, `ratings`, `availability`

### `Booking`
- `id`, `user_id`, `car_id`, `startDate`, `endDate`, `totalCost`, etc.

### `User`
- `id`, `name`, `email`, `role`, `passwordHash`


---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/shamos13/GariZetu.git

# Navigate into the project
cd GariZetu

# Build the project (if using Maven)
./mvnw clean install

# Run the app
./mvnw spring-boot:run
