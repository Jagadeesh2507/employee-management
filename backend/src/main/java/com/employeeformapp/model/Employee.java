package com.employeeformapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Employee {

	  @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private int id;

	    private String name;
	    private String gender;
	    private String skill;
	    private String designation;
	    private String dateofJoining;

	    @Column(unique = true)
	    private String email;

	    private String hasbankaccount;

	    @Column(unique = true)
	    private Long phoneNumber;

	    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
	   // @JsonIgnore   // STOP infinite loop!!!
	    private User user;

	    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL)
	    @JsonManagedReference
	    private Account account;


    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getSkill() {
         return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDateofJoining() {
        return dateofJoining;
    }

    public void setDateofJoining(String dateofJoining) {
        this.dateofJoining = dateofJoining;
    }

    public String getEmail() {
        return email;
    }
        public void setEmail(String email) {
            this.email = email;
        }

        public String getHasbankaccount() {
            return hasbankaccount;
        }

        public void setHasbankaccount(String hasbankaccount) {
            this.hasbankaccount = hasbankaccount;
        }

        public Long getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(Long phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public Account getAccount() {
            return account;
        }

        public void setAccount(Account account) {
            this.account = account;
        }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
        public String toString() {
            return "Employee{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", gender='" + gender + '\'' +
                    ", skill='" + skill + '\'' +
                    ", dateofJoining='" + dateofJoining + '\'' +
                    ", designation='" + designation + '\'' +
                    ", phoneNumber=" + phoneNumber +
                    ", hasbankaccount='" + hasbankaccount + '\'' +
                    ", account=" + (account != null ? account.getId() : "null") +
                    '}';
        }
    }