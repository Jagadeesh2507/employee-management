package com.employeeformapp.controller;

import com.employeeformapp.service.ReportService;
import com.sun.net.httpserver.HttpServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpServerErrorException;

import java.io.File;
import java.io.FileInputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

//    @PostMapping("/preview/project")
//    public ResponseEntity<Map<String, Object>> getProjectPreview(@RequestBody Map<String, Object> requestPayload) {
//        try {
//            Map<String, String> filters = (Map<String, String>) requestPayload.get("filters");
//            List<String> fields = (List<String>) requestPayload.get("fields");
//            int limit = requestPayload.get("limit") != null ? (int) requestPayload.get("limit") : 10;
//
//           // Map<String, Object> preview = reportService.buildProjectPreview(filters, fields, limit);
//            return ResponseEntity.ok(preview);
//
//        } catch (Exception e) {
//            Map<String, Object> error = new HashMap<>();
//            error.put("error", "Failed to generate project preview");
//            error.put("details", e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
//        }
//    }

    @PostMapping("/download/excel")
    public ResponseEntity<Resource> downloadExcel(@RequestBody Map<String, Object> requestPayload) {
        try {
            String reportType = (String) requestPayload.get("reportType");
            Map<String, String> filters = (Map<String, String>) requestPayload.get("filters");

            File file;
            try {
                file = reportService.generateReport(reportType, filters);
            } catch (Exception e) {
                e.printStackTrace(); // This will show the root cause
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }


            InputStreamResource resource = new InputStreamResource(new FileInputStream(file));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestBody Map<String, Object> requestPayload) {
        try {
            String reportType = str(requestPayload.get("reportType")).toLowerCase();
            Map<String, String> filters = (Map<String, String>) requestPayload.getOrDefault("filters", Collections.emptyMap());
            List<String> fields = (List<String>) requestPayload.get("fields");
            Integer limitObj = asInt(requestPayload.get("limit"));
            int limit = (limitObj == null || limitObj <= 0) ? 20 : limitObj;

            if (!"employee".equals(reportType) && !"project".equals(reportType)) {
                return ResponseEntity.badRequest().body("Invalid report type");
            }

            Map<String, Object> result = "employee".equals(reportType)
                    ? reportService.buildEmployeePreview(filters, fields, limit)
                    : reportService.buildProjectPreview(filters, fields, limit);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to build preview");
        }
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }

    private Integer asInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        try {
            return Integer.parseInt(o.toString());
        } catch (Exception e) {
            return null;
        }
    }

}
