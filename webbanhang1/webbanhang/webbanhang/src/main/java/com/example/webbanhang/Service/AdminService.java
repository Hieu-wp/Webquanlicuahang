package com.example.webbanhang.Service;

import java.util.Map;

public interface AdminService {
    Map<String, Object> getStats();
    Map<String, Object> getChart(String type);
}
