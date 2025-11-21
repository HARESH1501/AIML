import * as XLSX from 'xlsx';

/**
 * Reads and parses an Excel file
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<Array>} - Array of student objects
 */
export async function readExcelFile(filePath) {
  try {
    console.log('Loading Excel file from:', filePath);
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    console.log('Reading sheet:', sheetName);
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    console.log('Total rows in Excel:', jsonData.length);
    console.log('First row (headers):', jsonData[0]);
    
    // Process the data - find header row (might not be first row)
    let headerRowIndex = 0;
    let headers = [];
    
    // Try to find the header row (look for common header keywords)
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
        if (rowStr.includes('roll') || rowStr.includes('name') || rowStr.includes('reg')) {
          headerRowIndex = i;
          headers = row.map(h => String(h || '').trim());
          break;
        }
      }
    }
    
    // If no header found, use first row
    if (headers.length === 0 && jsonData.length > 0) {
      headers = jsonData[0].map(h => String(h || '').trim());
    }
    
    console.log('Using headers:', headers);
    
    if (jsonData.length <= headerRowIndex + 1) {
      console.warn('No data rows found in Excel file');
      return [];
    }
    
    const students = [];
    
    // Find column indices - be more flexible with matching
    const rollIndex = headers.findIndex(h => {
      const hLower = String(h).toLowerCase();
      return hLower.includes('roll') || hLower.includes('reg') || hLower.includes('registration');
    });
    
    const nameIndex = headers.findIndex(h => {
      const hLower = String(h).toLowerCase();
      return hLower.includes('name') || hLower.includes('student') || hLower.includes('candidate');
    });
    
    console.log('Roll column index:', rollIndex, 'Name column index:', nameIndex);
    
    // Find all other columns as subjects (exclude roll, name, and empty columns)
    const subjectIndices = {};
    headers.forEach((header, index) => {
      const hLower = String(header).toLowerCase();
      if (header && 
          header.trim() !== '' &&
          !hLower.includes('roll') && 
          !hLower.includes('name') && 
          !hLower.includes('reg') &&
          !hLower.includes('registration') &&
          !hLower.includes('student') &&
          !hLower.includes('candidate') &&
          !hLower.includes('total') &&
          !hLower.includes('average') &&
          !hLower.includes('percentage') &&
          !hLower.includes('rank')) {
        subjectIndices[header.trim()] = index;
      }
    });
    
    console.log('Subject columns found:', Object.keys(subjectIndices));
    
    // Process data rows
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      // Skip empty rows
      const hasData = row.some(cell => cell !== '' && cell !== null && cell !== undefined);
      if (!hasData) continue;
      
      const student = {
        roll: rollIndex >= 0 && row[rollIndex] ? String(row[rollIndex]).trim() : '',
        name: nameIndex >= 0 && row[nameIndex] ? String(row[nameIndex]).trim() : '',
      };
      
      // Add subject marks
      Object.keys(subjectIndices).forEach(subject => {
        const colIndex = subjectIndices[subject];
        const value = row[colIndex];
        
        // Convert to number if possible
        let numValue = 0;
        if (typeof value === 'number') {
          numValue = value;
        } else if (value !== '' && value !== null && value !== undefined) {
          const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
          numValue = isNaN(parsed) ? 0 : parsed;
        }
        
        student[subject] = numValue;
      });
      
      // Only add if student has a name or roll
      if ((student.name && student.name !== '') || (student.roll && student.roll !== '')) {
        students.push(student);
      }
    }
    
    console.log(`Successfully parsed ${students.length} students from Excel file`);
    console.log('Sample student:', students[0]);
    
    return students;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    console.error('Error details:', error.message, error.stack);
    return [];
  }
}
