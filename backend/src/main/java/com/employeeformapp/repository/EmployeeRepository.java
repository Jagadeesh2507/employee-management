package com.employeeformapp.repository;

import com.employeeformapp.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.phoneNumber = :phoneNumber OR e.email = :email")
    Long countByPhoneOrEmail(@Param("phoneNumber") Long phoneNumber, @Param("email") String email);

    // For update (exclude current employee)
    @Query("SELECT COUNT(e) FROM Employee e WHERE (e.phoneNumber = :phoneNumber OR e.email = :email) AND e.id <> :employeeId")
    Long countByPhoneOrEmailExcludingId(@Param("phoneNumber") Long phoneNumber, @Param("email") String email, @Param("employeeId") int employeeId);
    List<Employee> findByNameStartingWithIgnoreCase(String name);
  //  List<Employee> findByFilters(Map<String, String> filters);
}

