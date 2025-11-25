package com.employeeformapp.service;

import com.employeeformapp.dto.EmployeeRequestDTO;
import com.employeeformapp.exception.DuplicateEntryException;
import com.employeeformapp.model.Account;
import com.employeeformapp.model.Employee;
import com.employeeformapp.model.User;
import com.employeeformapp.repository.AccountRepository;
import com.employeeformapp.repository.EmployeeRepository;
import com.employeeformapp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AccountRepository accountRepository;

    @PersistenceContext
    private EntityManager entityManager;


    @Autowired
    private UserRepository userRepository;


    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Employee saveEmployee(EmployeeRequestDTO request) {

        // -------------------------
        // 1. Duplicate Employee Validations
        // -------------------------
        if (request.id == 0 && userRepository.findByUsername(request.username) != null) {
            throw new DuplicateEntryException("Username already exists");
        }

        Long duplicateEmployeeCount;

        if (request.id != 0) {
            duplicateEmployeeCount = employeeRepository
                    .countByPhoneOrEmailExcludingId(request.phoneNumber, request.email, request.id);
        } else {
            duplicateEmployeeCount = employeeRepository
                    .countByPhoneOrEmail(request.phoneNumber, request.email);
        }

        if (duplicateEmployeeCount != null && duplicateEmployeeCount > 0) {
            throw new DuplicateEntryException("An employee with this phone number or email already exists.");
        }


        // -------------------------
        // 2. Duplicate Account Validation
        // -------------------------
        if (request.accountNumber != null && !request.accountNumber.isEmpty()
                && request.bankName != null && !request.bankName.isEmpty()) {

            Long accountCount;

            if (request.id != 0) {
                accountCount = accountRepository.countAssignedAccountExcludingEmployee(
                        request.accountNumber, request.bankName, request.id
                );
            } else {
                accountCount = accountRepository.countTakenAccount(request.accountNumber, request.bankName);
            }

            if (accountCount != null && accountCount > 0) {
                throw new DuplicateEntryException(
                        "An account with this account number and bank name is already assigned to another employee."
                );
            }
        }


        // -------------------------
        // 3. Prepare Employee
        // -------------------------
        Employee emp = new Employee();
        emp.setId(request.id);
        emp.setName(request.name);
        emp.setGender(request.gender);
        emp.setSkill(request.skill);
        emp.setDateofJoining(request.dateofjoining);
        emp.setDesignation(request.designation);
        emp.setEmail(request.email);
        emp.setPhoneNumber(request.phoneNumber);
        emp.setHasbankaccount(request.hasBankAccount);


        // -------------------------
        // 4. Prepare Account
        // -------------------------
        Account acc = new Account();
        acc.setId(request.accId);
        acc.setBankName(request.bankName);
        acc.setAccountNumber(request.accountNumber);
        acc.setEmployee(emp);


        // -------------------------
        // 5. Prepare User (with NO double hashing)
        // -------------------------
        User user;

        if (request.userId == 0) {
            // ⭐ NEW USER — always hash password
            user = new User();
            user.setUsername(request.username);
            user.setPassword(passwordEncoder.encode(request.password));
            user.setRole(request.selectedRole);

        } else {
            // ⭐ EXISTING USER — fetch from DB
            user = userRepository.findById(request.userId).orElse(new User());
            user.setUsername(request.username);
            user.setRole(request.selectedRole);

            // ⭐ check if password was changed
            if (!passwordEncoder.matches(request.password, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(request.password));  // hash only when changed
            }
        }


        // -------------------------
        // 6. Two-way binding
        // -------------------------
        emp.setAccount(acc);
        emp.setUser(user);
        user.setEmployee(emp);


        // -------------------------
        // 7. Save (cascade does the rest)
        // -------------------------
        return employeeRepository.save(emp);
    }




    public void deleteEmployee(int id) {

        employeeRepository.deleteById(id);
    }
    public List<Employee> getAllEmployeesSortedByLatest(){
        return employeeRepository.findAll();
    }
    public List<Employee>searchByName(String name){
        return employeeRepository.findByNameStartingWithIgnoreCase(name);
    }


    public List<Employee> getFilteredEmployees(Map<String, String> filters) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
        Root<Employee> root = query.from(Employee.class);

        List<Predicate> predicates = new ArrayList<>();

        if (filters != null) {
            if (filters.containsKey("dojStart")) {
                String dojStart = filters.get("dojStart");
                if (dojStart != null && !dojStart.trim().isEmpty()) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("dateofJoining"), dojStart));
                }
            }

            if (filters.containsKey("dojEnd")) {
                String dojEnd = filters.get("dojEnd");
                if (dojEnd != null && !dojEnd.trim().isEmpty()) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("dateofJoining"), dojEnd));
                }
            }

            if (filters.containsKey("department")) {
                String designation = filters.get("department");
                if (designation != null && !designation.trim().isEmpty()) {
                    predicates.add(cb.equal(cb.lower(root.get("designation")), designation.toLowerCase()));
                }
            }
        }

        query.where(cb.and(predicates.toArray(new Predicate[0])));
        query.orderBy(cb.desc(root.get("dateofJoining")));

        return entityManager.createQuery(query).getResultList();
    }




    public List<Employee> searchBySkill(String searchSkills) {
        String[] skills = searchSkills.split(",");

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Employee> query = cb.createQuery(Employee.class);
        Root<Employee> root = query.from(Employee.class);

        List<Predicate> predicates = new ArrayList<>();
        for (String skill : skills) {
            if (skill != null && !skill.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("skill")), "%" + skill.trim().toLowerCase() + "%"));
            }
        }

        query.where(cb.or(predicates.toArray(new Predicate[0])));
        return entityManager.createQuery(query).getResultList();
    }
    public Employee getEmployeeById(int id) {
        return employeeRepository.findById(id).orElse(null);
    }


}

