package com.employeeformapp.service;

import com.employeeformapp.model.Employee;
import com.employeeformapp.model.Project;
import com.employeeformapp.repository.EmployeeRepository;
import com.employeeformapp.repository.ProjectRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ProjectService projectService;

    public File generateReport(String reportType, Map<String, String> filters) throws Exception {
        if ("employee".equalsIgnoreCase(reportType)) {
            return generateEmployeeExcel(filters);
        } else if ("project".equalsIgnoreCase(reportType)) {
            return generateProjectExcel(filters);
        } else {
            throw new IllegalArgumentException("Invalid report type");
        }
    }

    private File generateEmployeeExcel(Map<String, String> filters) throws Exception {
        List<Employee> employees = employeeService.getFilteredEmployees(filters); // You need to implement this method

        String[] headers = { "S.NO", "Name", "Gender", "Date of Joining", "Designation", "Email", "Phone Number",
                "Has Bank Account", "Bank Name", "Account Number" };

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Employee Report");

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }

        int rowNum = 1;
        for (Employee employee : employees) {
            Row dataRow = sheet.createRow(rowNum);
            dataRow.createCell(0).setCellValue(rowNum);
            dataRow.createCell(1).setCellValue(employee.getName());
            dataRow.createCell(2).setCellValue(employee.getGender());
            dataRow.createCell(3).setCellValue(employee.getDateofJoining());
            dataRow.createCell(4).setCellValue(employee.getDesignation());
            dataRow.createCell(5).setCellValue(employee.getEmail());
            dataRow.createCell(6).setCellValue(employee.getPhoneNumber());
            dataRow.createCell(7).setCellValue("true".equalsIgnoreCase(employee.getHasbankaccount()) ? "Yes" : "No");

            if (employee.getAccount() != null) {
                dataRow.createCell(8).setCellValue(employee.getAccount().getBankName());
                dataRow.createCell(9).setCellValue(employee.getAccount().getAccountNumber());
            } else {
                dataRow.createCell(8).setCellValue("");
                dataRow.createCell(9).setCellValue("");
            }

            rowNum++;
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        File file = new File("employee_report.xlsx");
        try (FileOutputStream out = new FileOutputStream(file)) {
            workbook.write(out);
        }
        workbook.close();
        return file;
    }

    private File generateProjectExcel(Map<String, String> filters) throws Exception {
        List<Project> projects = projectService.getFilteredProjects(filters); // You need to implement this method

        String[] headers = { "S.NO", "Title", "Description", "Technology", "Client Name", "Budget", "Start Date", "End Date" };

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Project Report");

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }

        int rowNum = 1;
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

        for (int i = 0; i < projects.size(); i++) {
            Project proj = projects.get(i);
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(i + 1);
            row.createCell(1).setCellValue(proj.getTitle());
            row.createCell(2).setCellValue(proj.getDescription());
            row.createCell(3).setCellValue(proj.getTechnology());
            row.createCell(4).setCellValue(proj.getClientName());
            row.createCell(5).setCellValue(proj.getBudget());
            row.createCell(6).setCellValue(sdf.format(proj.getStartDate()));
            row.createCell(7).setCellValue(sdf.format(proj.getEndDate()));
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        File file = new File("project_report.xlsx");
        try (FileOutputStream out = new FileOutputStream(file)) {
            workbook.write(out);
        }
        workbook.close();
        return file;
    }

    public Map<String, Object> buildEmployeePreview(Map<String, String> filters, List<String> fields, int limit) {
        List<String> defaultColumns = Arrays.asList(
                "S.NO", "Name", "Gender", "Date of Joining", "Designation", "Email", "Phone Number",
                "Has Bank Account", "Bank Name", "Account Number"
        );
        List<String> columns = sanitizeColumns(fields, defaultColumns);

        List<Employee> employees = employeeService.getFilteredEmployees(filters);
        long total = employees.size();

        List<Map<String, Object>> rows = new ArrayList<>();
        int max = Math.min(limit, employees.size());

        for (int i = 0; i < max; i++) {
            Employee e = employees.get(i);
            Map<String, Object> row = new LinkedHashMap<>();
            for (String col : columns) {
                switch (col) {
                    case "S.NO": row.put(col, i + 1); break;
                    case "Name": row.put(col, nz(e.getName())); break;
                    case "Gender": row.put(col, nz(e.getGender())); break;
                    case "Date of Joining": row.put(col, nz(e.getDateofJoining())); break;
                    case "Designation": row.put(col, nz(e.getDesignation())); break;
                    case "Email": row.put(col, nz(e.getEmail())); break;
                    case "Phone Number": row.put(col, nz(e.getPhoneNumber())); break;
                    case "Has Bank Account":
                        String has = "true".equalsIgnoreCase(e.getHasbankaccount()) ? "Yes" : "No";
                        row.put(col, has);
                        break;
                    case "Bank Name":
                        row.put(col, e.getAccount() != null ? nz(e.getAccount().getBankName()) : "");
                        break;
                    case "Account Number":
                        row.put(col, e.getAccount() != null ? nz(e.getAccount().getAccountNumber()) : "");
                        break;
                }
            }
            rows.add(row);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("columns", columns);
        response.put("rows", rows);
        response.put("total", total);
        return response;
    }

    public Map<String, Object> buildProjectPreview(Map<String, String> filters, List<String> fields, int limit) {
        List<String> defaultColumns = Arrays.asList(
                "S.NO", "Title", "Description", "Technology", "Client Name", "Budget",
                "Start Date", "End Date"
        );
        List<String> columns = sanitizeColumns(fields, defaultColumns);

        List<Project> projects = projectService.getFilteredProjects(filters);
        long total = projects.size();

        List<Map<String, Object>> rows = new ArrayList<>();
        int max = Math.min(limit, projects.size());

        for (int i = 0; i < max; i++) {
            Project p = projects.get(i);
            Map<String, Object> row = new LinkedHashMap<>();
            for (String col : columns) {
                switch (col) {
                    case "S.NO": row.put(col, i + 1); break;
                    case "Title": row.put(col, nz(p.getTitle())); break;
                    case "Description": row.put(col, nz(p.getDescription())); break;
                    case "Technology": row.put(col, nz(p.getTechnology())); break;
                    case "Client Name": row.put(col, nz(p.getClientName())); break;
                    case "Budget": row.put(col, p.getBudget()); break;
                    case "Start Date":
                        row.put(col, p.getStartDate() != null ? new SimpleDateFormat("dd-MM-yyyy").format(p.getStartDate()) : "");
                        break;
                    case "End Date":
                        row.put(col, p.getEndDate() != null ? new SimpleDateFormat("dd-MM-yyyy").format(p.getEndDate()) : "");
                        break;
                }
            }
            rows.add(row);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("columns", columns);
        response.put("rows", rows);
        response.put("total", total);
        return response;
    }

    private List<String> sanitizeColumns(List<String> requested, List<String> defaultColumns) {
        if (requested == null || requested.isEmpty()) return defaultColumns;
        Set<String> valid = new HashSet<>(defaultColumns);
        List<String> filtered = new ArrayList<>();
        for (String f : requested) {
            if (valid.contains(f)) filtered.add(f);
        }
        return filtered.isEmpty() ? defaultColumns : filtered;
    }

    private String nz(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

}

