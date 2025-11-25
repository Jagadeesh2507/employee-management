package com.employeeformapp.service;

import com.employeeformapp.dto.AssignedEmployeeDTO;
import com.employeeformapp.dto.ProjectAssignmentRequest;
import com.employeeformapp.dto.ProjectAssignmentResponse;
import com.employeeformapp.model.Employee;
import com.employeeformapp.model.Project;
import com.employeeformapp.model.ProjectAssignment;
import com.employeeformapp.repository.EmployeeRepository;
import com.employeeformapp.repository.ProjectAssignmentRepository;
import com.employeeformapp.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectAssignmentService {
    @Autowired
    private ProjectAssignmentRepository projectAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private ProjectRepository projectRepository;

    public boolean isEmployeeAvailable(int empId, Date newAssignmentDate){
        List<ProjectAssignment> assignments = projectAssignmentRepository.findActiveAssignments(empId, newAssignmentDate);
        return assignments.isEmpty();

    }


    public ProjectAssignmentResponse assignProject(ProjectAssignmentRequest dto) {
        Optional<Employee> empOpt = employeeRepository.findById(dto.employee.id);
        Optional<Project> projOpt = projectRepository.findById(dto.project.id);

        if (empOpt.isEmpty() || projOpt.isEmpty()) {
            return new ProjectAssignmentResponse("error", "Invalid employee or project ID");
        }

        Project proj = projOpt.get();
        if ("COMPLETED".equalsIgnoreCase(proj.getStatus())) {
            return new ProjectAssignmentResponse("error", "Project was already Completed..");
        }

        if (!isEmployeeAvailable(dto.employee.id, dto.assignedDate)) {
            return new ProjectAssignmentResponse("error", "Employee already assigned to another project.");
        }

        ProjectAssignment assign = new ProjectAssignment();
        assign.setEmployee(empOpt.get());
        assign.setProject(proj);
        assign.setRole(dto.role);
        assign.setAssignedDate(dto.assignedDate);
        assign.setRemarks(dto.remarks);
        assign.setEndDate(dto.endDate);

        projectAssignmentRepository.save(assign);

        return new ProjectAssignmentResponse("success", "Project assigned successfully");
    }

    public List<AssignedEmployeeDTO> getAssignedEmployees(){
        List<AssignedEmployeeDTO> assignedEmployees = projectAssignmentRepository.findAllAssignedEmployees();
        return assignedEmployees;
   }

   public List<Employee> getUnAssignedEmployees(){
        List<Employee> unAssignedEmployees = projectAssignmentRepository.findUnassignedEmployees();
        return unAssignedEmployees;
   }
   public List<Project> getUpcomingDeadlineAssignments(){
       LocalDate today = LocalDate.now();
       LocalDate threeDaysLater = today.plusDays(3);
       Date startDate = java.sql.Date.valueOf(today);
       Date endDate = java.sql.Date.valueOf(threeDaysLater);

       return projectRepository.findProjectsWithUpcomingDeadlines(startDate, endDate);
   }

    public boolean removeAssignmentById(int id) {
        Optional<ProjectAssignment> projectAssignment = projectAssignmentRepository.findById(id);
        boolean deleted = false;

        if (projectAssignment.isPresent()) {
            projectAssignmentRepository.deleteById(id);
            deleted = true;
        }
        return deleted;
    }



}
