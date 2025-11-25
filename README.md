🚀 Employee Management System

A modern full-stack application for managing employees, projects, assignments, and HR operations. Built using Angular, Spring Boot, Hibernate, and MySQL.

🌟 Features

👨‍💼 Employee Management — Create, update, & manage employee details

👨‍💻 Project Assignment — Assign employees to projects with roles

📊 Project Management — Create & maintain project details

🔐 JWT Authentication — Secure login with role-based access (Admin/Employee)

📄 Reporting — Export data such as assigned employees (Excel)

📱 Responsive UI — Clean and modern Angular design

⚡ Backend APIs — High-performance REST services using Hibernate + MySQL

🛠️ Tech Stack
Frontend

Angular 17

Bootstrap 5

TypeScript

RxJS

Backend

Java 17

Spring Boot

Spring Security + JWT

Hibernate / JPA

MySQL

📦 Project Structure
employee-management/
│── frontend/        # Angular application
│── backend/         # Spring Boot API
│── README.md
│── .gitignore

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/Jagadeesh2507/employee-management.git
cd employee-management

🖥️ Frontend Setup (Angular)
cd frontend
npm install
npm start


The Angular app runs at:
👉 http://localhost:4200

⚙️ Backend Setup (Spring Boot)
Update application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
server.port=8080

Run the Backend
cd backend
mvn spring-boot:run


Backend runs at:
👉 http://localhost:8080

🔌 API Overview
Method	Endpoint	Description
POST	/api/auth/login	User login (JWT)
GET	/api/secured/employees	Get all employees
GET	/api/secured/projects/my-projects/{empId}	Get projects assigned to employee
POST	/assignments/save	Assign employee to project
GET	/projects/all	List all projects

📘 Full API documentation:
👉 See API.md

🧪 Testing
Frontend
cd frontend
npm test

Backend
cd backend
mvn test

🐳 Docker Support (optional)

If you want, I can generate Dockerfile + docker-compose.yml and update README.

🤝 Contributing

Contributions are welcome!

Fork this repo

Create a feature branch

Commit your changes

Open a Pull Request

📄 License

This project is licensed under the MIT License.
See the LICENSE
 file for details.

💬 Support

If you find any issues, feel free to open a ticket:
👉 https://github.com/Jagadeesh2507/employee-management/issues

⭐ Like this project?

Give it a star ⭐ on GitHub — it motivates further improvements!
