package com.budgettracker.service;

public class DBConnection {
    private static final DBConnection INSTANCE = new DBConnection();
    private final String source = "SpringBootManagedDataSource";

    private DBConnection() {
    }

    public static DBConnection getInstance() {
        return INSTANCE;
    }

    public String getSource() {
        return source;
    }
}
