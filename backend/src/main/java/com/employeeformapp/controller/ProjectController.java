package com.employeeformapp.controller;

import com.employeeformapp.dto.ProjectRequest;
import com.employeeformapp.dto.ProjectResponse;
import com.employeeformapp.model.Project;
import com.employeeformapp.model.ProjectAssignment;
import com.employeeformapp.service.ProjectService;
import jakarta.websocket.server.PathParam;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;

   ProjectResponse projectResponse=new ProjectResponse();
    @GetMapping("/all")
    public List<Project> getAllProjects(){
        List<Project> projects = projectService.allProjects();
        return projects;
    }

    @PostMapping("/create")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest proj) {
        Project project = new Project(); // Ensure a new Project object is created

        project.setId(proj.getId());
        project.setBudget(proj.getBudget());
        project.setClientName(proj.getClientName());
        project.setDescription(proj.getDescription());
        project.setTitle(proj.getTitle());
        project.setTechnology(proj.getTechnology());
        project.setStartDate(proj.getStartDate());
        project.setEndDate(proj.getEndDate());

        //ProjectResponse projectResponse = new ProjectResponse();

        try {
            projectService.saveOrUpdate(project);

            if (proj.getId() != 0) {
                projectResponse.setStatus("success");
                projectResponse.setMessage("Project Updated");
            } else {
                projectResponse.setStatus("success");
                projectResponse.setMessage("Project saved");
            }

            return ResponseEntity.ok(projectResponse);

        } catch (Exception e) {
            projectResponse.setStatus("Failed");
            projectResponse.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(projectResponse);
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ProjectResponse> deleteProject(@PathVariable("id") int id){
        try{
            if(projectService.deleteProject(id)){
                projectResponse.setStatus("success");
                projectResponse.setMessage("Project deleted");
            }
            else{
                projectResponse.setStatus("failed");
                projectResponse.setMessage("Project not found");

            }
            return ResponseEntity.ok(projectResponse);

        }
        catch(Exception e){
            projectResponse.setStatus("failed");
            projectResponse.setMessage("Error :"+e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(projectResponse);
        }
    }

    @GetMapping("/assigned-employees-excel/{projectId}")
    public ResponseEntity<byte[]> downloadAssignedEmployeesExcel(@PathVariable int projectId) {
        try {
            List<ProjectAssignment> assignments = projectService.getAssignmentsByProjectId(projectId);

            if (assignments == null || assignments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No employees assigned to this project.".getBytes());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Assigned Employees");

                // Merged Header Row for Project Name
                Row projectHeader = sheet.createRow(0);
                Cell projectNameCell = projectHeader.createCell(0);
                projectNameCell.setCellValue("Project: " + assignments.get(0).getProject().getTitle());

                sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerFont.setFontHeightInPoints((short) 14);
                headerStyle.setFont(headerFont);
                headerStyle.setAlignment(HorizontalAlignment.CENTER);
                projectNameCell.setCellStyle(headerStyle);

                // Column Headers
                Row columnHeader = sheet.createRow(1);
                String[] columns = {"Employee Name", "Role", "Assigned Date"};
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = columnHeader.createCell(i);
                    cell.setCellValue(columns[i]);

                    CellStyle columnStyle = workbook.createCellStyle();
                    Font columnFont = workbook.createFont();
                    columnFont.setBold(true);
                    columnStyle.setFont(columnFont);
                    columnStyle.setAlignment(HorizontalAlignment.CENTER);
                    cell.setCellStyle(columnStyle);
                }

                // Data Rows
                int rowNum = 2;
                SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

                for (ProjectAssignment pa : assignments) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(pa.getEmployee().getName());
                    row.createCell(1).setCellValue(pa.getRole());
                    row.createCell(2).setCellValue(sdf.format(pa.getAssignedDate()));
                }

                // Auto-size columns
                for (int i = 0; i < columns.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(out);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "assigned-employees-" + projectId + ".xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Failed to generate Excel file: " + e.getMessage()).getBytes());
        }
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<List<Project>> searchByTitle(@PathVariable String title) {
        List<Project> projects = projectService.searchByTitle(title);
        return ResponseEntity.ok(projects);
    }
    @GetMapping("/my-projects/{employeeId}")
    public ResponseEntity<?> getProjectsByEmployee(@PathVariable int employeeId) {

        try {
            List<Project> myProjects = projectService.getProjectsByEmployeeId(employeeId);
            return ResponseEntity.ok(myProjects);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    


}
