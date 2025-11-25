package com.employeeformapp.controller;

import com.employeeformapp.dto.AssignedEmployeeDTO;
import com.employeeformapp.dto.ProjectAssignmentRequest;
import com.employeeformapp.dto.ProjectAssignmentResponse;
import com.employeeformapp.model.Employee;
import com.employeeformapp.model.Project;
import com.employeeformapp.model.ProjectAssignment;
import com.employeeformapp.repository.EmployeeRepository;
import com.employeeformapp.repository.ProjectRepository;
import com.employeeformapp.service.ProjectAssignmentService;
import com.employeeformapp.service.ProjectService;
import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/assignments")
public class ProjectAssignmentController {
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectAssignmentService projectAssignmentService;


    @PostMapping("/save")
    public ResponseEntity<ProjectAssignmentResponse> assignProject(@RequestBody ProjectAssignmentRequest dto) {
        try {
            ProjectAssignmentResponse response = projectAssignmentService.assignProject(dto);
            if ("error".equalsIgnoreCase(response.status)) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ProjectAssignmentResponse("error", "Assignment failed"));
        }
    }

    @GetMapping("/assigned")
    public List<AssignedEmployeeDTO> getAssignedEmployees(){
        List<AssignedEmployeeDTO> projectAssignments=projectAssignmentService.getAssignedEmployees();
        return projectAssignments;
   }
    @GetMapping("/unassigned")
    public List<Employee> getUnAssignedEmployees(){
        List<Employee> unAssignedEmployees=projectAssignmentService.getUnAssignedEmployees();
        return unAssignedEmployees;
    }
    @GetMapping("/upcoming-deadlines")
    public ResponseEntity getUpcomingDeadlines(){
        List<Project> deadLineProjects=projectAssignmentService.getUpcomingDeadlineAssignments();
        return ResponseEntity.ok(deadLineProjects);
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<ProjectAssignmentResponse> removeAssignment(@PathVariable("id") int id) {
        boolean removed = projectAssignmentService.removeAssignmentById(id);

        if (removed) {
            return ResponseEntity.ok(new ProjectAssignmentResponse("Success...", "Assignment removed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ProjectAssignmentResponse("Failed...", "Assignment not found"));
        }
    }


}
