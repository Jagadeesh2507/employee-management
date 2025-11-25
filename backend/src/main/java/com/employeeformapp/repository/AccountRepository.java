package com.employeeformapp.repository;

import com.employeeformapp.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    // Check if an account is already assigned to another employee
    @Query("SELECT COUNT(a) FROM Account a WHERE a.accountNumber = :accountNumber AND a.bankName = :bankName AND a.employee.id <> :employeeId")
    Long countAssignedAccountExcludingEmployee(@Param("accountNumber") String accountNumber,
                                               @Param("bankName") String bankName,
                                               @Param("employeeId") int employeeId);

    // Check if an account is already taken (for new employee)
    @Query("SELECT COUNT(a) FROM Account a WHERE a.accountNumber = :accountNumber AND a.bankName = :bankName")
    Long countTakenAccount(@Param("accountNumber") String accountNumber,
                           @Param("bankName") String bankName);
}

