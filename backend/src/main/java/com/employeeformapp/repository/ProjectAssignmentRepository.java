package com.employeeformapp.repository;

import com.employeeformapp.dto.AssignedEmployeeDTO;
import com.employeeformapp.model.Employee;
import com.employeeformapp.model.Project;
import com.employeeformapp.model.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment,Integer> {

    List<ProjectAssignment> findByProjectId(int projectId);
    void deleteByProjectId(int projectId);
    
    @Query("SELECT pa FROM ProjectAssignment pa WHERE pa.employee.id = :empId AND pa.endDate >= :currentDate")
    List<ProjectAssignment> findActiveAssignments(@Param("empId") int empId, @Param("currentDate") Date currentDate);


    @Query("SELECT new com.employeeformapp.dto.AssignedEmployeeDTO(" +
            "pa.id, pa.employee.id, pa.employee.name, pa.project.title, pa.project.endDate) " +
            "FROM ProjectAssignment pa")
    List<AssignedEmployeeDTO> findAllAssignedEmployees();

    @Query("SELECT e FROM Employee e WHERE e.id NOT IN (SELECT pa.employee.id FROM ProjectAssignment pa)")
    List<Employee> findUnassignedEmployees();

    @Query("SELECT pa.project FROM ProjectAssignment pa WHERE pa.employee.id = :employeeId")
    List<Project> findProjectsByEmployeeId(@Param("employeeId") int employeeId);



}
