/* ========================================
   STUDENT MANAGEMENT SYSTEM - ENHANCED FEATURES
   JavaScript File - Full Implementation
   ======================================== */

// ===== CONSTANTS =====
const STORAGE_KEY = 'students_data';
const VALIDATION_RULES = {
    studentName: { pattern: /^[a-zA-Z\s]{2,}$/, message: 'Name must be at least 2 characters and contain only letters' },
    rollNumber: { pattern: /^[a-zA-Z0-9]{2,}$/, message: 'Roll number is invalid' },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
    phone: { pattern: /^[0-9]{10}$/, message: 'Phone must be 10 digits' },
    dateOfBirth: { message: 'Date of birth is required' }
};

// ===== USER LOGIN =====
function handleLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    // Simple validation for demo
    if (username && password) {
        // Redirect to form page after successful login
        window.location.href = 'form.html';
    } else {
        showAlert('Please enter username and password', 'error');
    }
}

// ===== FORM SUBMISSION =====
function handleFormSubmit() {
    const form = document.getElementById('studentForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Get form data
    const formData = {
        id: Date.now().toString(),
        studentName: document.getElementById('studentName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        rollNumber: document.getElementById('rollNumber').value,
        course: document.getElementById('course').value,
        semester: document.getElementById('semester').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        guardianContact: document.getElementById('guardianContact').value,
        createdAt: new Date().toLocaleDateString()
    };
    
    // Validate form
    if (!validateForm(formData)) {
        showAlert('Please fix the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline';
    
    // Simulate processing delay
    setTimeout(() => {
        // Load existing students
        const students = loadStudents();
        
        // Add new student
        students.push(formData);
        
        // Save to localStorage
        saveStudents(students);
        
        // Reset loading state
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        
        // Show success message
        showAlert('✓ Student added successfully!', 'success');
        
        // Reset form
        setTimeout(() => {
            form.reset();
            clearAllErrors();
            // Redirect to student list
            setTimeout(() => {
                window.location.href = 'studentdata.html';
            }, 2000);
        }, 500);
    }, 1500);
}

// ===== FORM VALIDATION =====
function validateForm(formData) {
    let isValid = true;
    clearAllErrors();
    
    const validations = {
        studentName: formData.studentName.trim().length >= 2,
        dateOfBirth: formData.dateOfBirth !== '',
        gender: formData.gender !== '',
        phone: /^[0-9]{10}$/.test(formData.phone),
        rollNumber: formData.rollNumber.trim().length >= 2,
        course: formData.course !== '',
        semester: formData.semester !== '',
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
        guardianContact: formData.guardianContact === '' || /^[0-9]{10}$/.test(formData.guardianContact)
    };
    
    // Show errors for invalid fields
    for (const field in validations) {
        if (!validations[field]) {
            showFieldError(field);
            isValid = false;
        }
    }
    
    return isValid;
}

// ===== SHOW FIELD ERROR =====
function showFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const formGroup = field?.parentElement;
    
    if (formGroup) {
        formGroup.classList.add('show-error');
        field.classList.add('error');
    }
}

// ===== CLEAR ALL ERRORS =====
function clearAllErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('show-error');
        const input = group.querySelector('.form-control');
        if (input) {
            input.classList.remove('error');
        }
    });
}

// ===== FORM RESET =====
function handleReset() {
    const form = document.getElementById('studentForm');
    form.reset();
    clearAllErrors();
    hideAllAlerts();
}

// ===== EDIT STUDENT =====
function handleEdit(id) {
    const students = loadStudents();
    const student = students.find(s => s.id === id);
    
    if (student) {
        // Store in session for edit page
        sessionStorage.setItem('editStudent', JSON.stringify(student));
        window.location.href = 'edit.html';
    } else {
        showAlert('Student not found', 'error');
    }
}

// ===== DELETE STUDENT =====
function handleDelete(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        const students = loadStudents();
        const filtered = students.filter(s => s.id !== id);
        saveStudents(filtered);
        
        showAlert('✓ Student deleted successfully!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// ===== UPDATE STUDENT =====
function handleUpdate() {
    const editStudent = JSON.parse(sessionStorage.getItem('editStudent'));
    if (!editStudent) return;
    
    const updatedData = {
        ...editStudent,
        studentName: document.getElementById('studentName')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value,
        course: document.getElementById('course')?.value,
        semester: document.getElementById('semester')?.value,
        address: document.getElementById('address')?.value,
        city: document.getElementById('city')?.value,
        state: document.getElementById('state')?.value,
        gender: document.getElementById('gender')?.value,
        dateOfBirth: document.getElementById('dateOfBirth')?.value
    };
    
    if (validateForm(updatedData)) {
        const students = loadStudents();
        const index = students.findIndex(s => s.id === editStudent.id);
        
        if (index !== -1) {
            students[index] = updatedData;
            saveStudents(students);
            showAlert('✓ Student updated successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'studentdata.html';
            }, 1500);
        }
    }
}

// ===== SEARCH & FILTER =====
function handleSearch() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase();
    const tableRows = document.querySelectorAll('#studentTable tbody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchInput) ? '' : 'none';
    });
}

// ===== LOAD STUDENTS FROM STORAGE =====
function loadStudents() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getSampleData();
    } catch (error) {
        console.error('Error loading students:', error);
        return getSampleData();
    }
}

// ===== SAVE STUDENTS TO STORAGE =====
function saveStudents(students) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        console.log('Students saved successfully');
    } catch (error) {
        console.error('Error saving students:', error);
        showAlert('Error saving student data', 'error');
    }
}

// ===== SAMPLE DATA (FOR DEMO) =====
function getSampleData() {
    return [
        {
            id: '1',
            studentName: 'John Doe',
            rollNumber: 'CS101',
            course: 'Computer Science',
            email: 'john.doe@example.com',
            phone: '9876543210',
            dateOfBirth: '2002-05-15',
            gender: 'male',
            semester: '4',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            guardianContact: '9876543200',
            createdAt: '2/13/2026'
        },
        {
            id: '2',
            studentName: 'Jane Smith',
            rollNumber: 'ME202',
            course: 'Mechanical Engineering',
            email: 'jane.smith@example.com',
            phone: '9876543211',
            dateOfBirth: '2003-03-20',
            gender: 'female',
            semester: '2',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            guardianContact: '9876543201',
            createdAt: '2/13/2026'
        }
    ];
}

// ===== DISPLAY STUDENTS IN TABLE =====
function displayStudents() {
    const tableBody = document.querySelector('#studentTable tbody');
    if (!tableBody) return;
    
    const students = loadStudents();
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No students found. <a href="form.html" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">Add one now</a></td></tr>';
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentName}</td>
            <td>${student.rollNumber}</td>
            <td>${student.course}</td>
            <td>${student.email}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-success" onclick="handleEdit('${student.id}')">
                        Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="handleDelete('${student.id}')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update stats
    updateStats(students);
}

// ===== UPDATE STATISTICS =====
function updateStats(students) {
    const uniqueCourses = [...new Set(students.map(s => s.course))].length;
    
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 3) {
        statCards[0].textContent = students.length;
        statCards[1].textContent = uniqueCourses;
        statCards[2].textContent = students.length > 0 ? '100%' : '0%';
    }
}

// ===== SHOW ALERT =====
function showAlert(message, type) {
    const alertId = type === 'success' ? 'successAlert' : 'errorAlert';
    const alert = document.getElementById(alertId);
    
    if (alert) {
        alert.textContent = message;
        alert.style.display = 'block';
        alert.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.style.display = 'none';
            alert.classList.remove('show');
        }, 5000);
    }
}

// ===== HIDE ALL ALERTS =====
function hideAllAlerts() {
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) errorAlert.style.display = 'none';
}

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    // Display students on studentdata page
    if (document.getElementById('studentTable')) {
        displayStudents();
    }
    
    // Clear input field error styles on focus
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            this.parentElement?.classList.remove('show-error');
        });
    });
});