import React, { useState ,useEffect} from 'react'
import axios from 'axios';
import { PencilIcon, TrashIcon,  RefreshIcon ,CheckIcon } from '@heroicons/react/solid';

function Table() {

    const [data,setData]=useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editableContent, setEditableContent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedRows,setSelectedRows]=useState([])




    useEffect(()=>{
        const fetchData = async () => {
            try {
              const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'); // Replace with your API endpoint
              setData(response.data);
              setFilteredData(response.data);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          };
      
          fetchData();
        }, []);
  // Get current rows
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
        const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
      
      
      
       
      
      
        // Calculate total number of pages based on filtered data
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        // Change page
        const paginate = (pageNumber) => setCurrentPage(pageNumber);
      
        // Navigate to first, last, previous, and next pages
        const goToFirstPage = () => paginate(1);
        const goToLastPage = () => paginate(totalPages);
        const goToPreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
        const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
 

   // Handle edit and delete actions
  const handleEdit = (rowId) => {
    setEditingRowId(rowId);
    // Set the current content of the row to editableContent state
    const rowToEdit = data.find((row) => row.id === rowId);
    setEditableContent({
      id: rowToEdit.id,
      name: rowToEdit.name,
      email: rowToEdit.email,
      role:rowToEdit.role,
    });
  };
  const handleSave = () => {
    // Save the edited content and reset editing state
    const newData = filteredData.map((row) =>
      row.id === editingRowId ? { ...row, name: editableContent.name, email:editableContent.email, role:editableContent.role} : row
    );
    setFilteredData(newData);
    setData(newData)
    setEditingRowId(null);
  };
  const handleDelete = (rowId) => {
    // Delete logic here (you may want to confirm the deletion)
    const newData = filteredData.filter((row) => row.id !== rowId);
    setFilteredData(newData);
    setData(newData)
    setEditingRowId(null); // Reset editing state if the row being edited is deleted
  };

  const handleDeleteSelectedRows = () => {
    const updatedRows = filteredData.filter((row) => !selectedRows.includes(row.id));
    setFilteredData(updatedRows);
    setData(updatedRows)
    // Clear the selected rows after deletion
    setSelectedRows([]);
    setSelectAll(false);
  };
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setSelectedRows(selectAll ? [] : currentRows.map((row) => row.id));
  };
  
const handleChange=(e)=>{
  setSearchQuery(e.target.value);
 
}
  const handleSearch = () => {
    if(searchQuery){
      const newFilteredData = data.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredData(newFilteredData);
    setCurrentPage(1); 
    }
  
  
    
  };

  const handleRefresh = () => {
    // Handle refresh logic here
    setFilteredData(data)
    setSearchQuery("")
    // Update the rotation angle (e.g., rotate by 360 degrees)
    setRotation(rotation - 360);
  };


  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(rowId)) {
        // If the row is already selected, remove it from the selectedRows array
        return prevSelectedRows.filter((id) => id !== rowId);
      } else {
        // If the row is not selected, add it to the selectedRows array
        return [...prevSelectedRows, rowId];
      }
    });

  };


  
useEffect(()=>{
  setSelectAll(false);
  setSelectedRows([])

},[currentPage])

  
  return (
    <div className="container mx-auto my-8">
      <div className='flex justify-between'>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleChange}
          className="px-2 py-1 border border-gray-300 rounded"
        />
        <button className={`ml-2 px-3 py-1 bg-blue-500 text-white rounded ${searchQuery ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={handleSearch} >Search</button>
       <button className="ml-2 "  onClick={() => handleRefresh()}
        style={{ transform: `rotate(${rotation}deg)`,transition:"all 1s " }}><RefreshIcon className="h-5 w-5 text-blue-500 cursor-pointer" /></button> 
      </div><div><button className="text-red-500 hover:text-red-700  border p-2 rounded " onClick={handleDeleteSelectedRows}>
                <TrashIcon className="h-5 w-5" />
              </button></div></div>
      {filteredData.length>0?
       <table className="min-w-full border border-gray-300">
        <thead className='border-b-2 border-black'>
         <tr><th className=" p-4 text-left"><input type='checkbox' checked={selectAll}
                onChange={handleSelectAllChange}></input></th>
        <th className=" p-4 text-left">Name</th>
        <th className=" p-4 text-left">Email</th>
        <th className=" p-4 text-left">Role</th>
        <th className=" p-4 text-left">Actions</th></tr></thead>
        <tbody>
        {currentRows.map((row) => (
            <tr key={row.id} className={`border-b  ${editingRowId === row.id?'bg-red-200':(selectedRows.includes(row.id) ? 'bg-gray-200' : '')}`}>
              <td className=" p-4 text-left text-sm">
               <input type='checkbox' checked={selectedRows.includes(row.id)}onChange={()=>{handleCheckboxChange(row.id)}}></input>
              </td>
              <td className=" p-2 text-left text-sm">{editingRowId === row.id ? (
                  <input
                  className='p-2'
                    type="text"
                    value={editableContent.name}
                    onChange={(e) =>
                      setEditableContent((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  row.name
                )}</td>
              <td className=" p-2 text-left text-sm">{editingRowId === row.id ? (
                  <input
                  className='p-2'
                    type="text"
                    value={editableContent.email}
                    onChange={(e) =>
                      setEditableContent((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                ) : (
                  row.email
                )}</td>
              <td className="p-2 text-left text-sm italic">{editingRowId === row.id ? (
                  <input
                  className='p-2'
                    type="text"
                    value={editableContent.role}
                    onChange={(e) =>
                      setEditableContent((prev) => ({ ...prev, role: e.target.value }))
                    }
                  />
                ) : (
                  row.role
                )}</td>
              <td className=" p-2 text-left text-sm">  {editingRowId === row.id ? (
                  <button className="text-green-500 border hover:text-green-700 p-2 rounded" onClick={handleSave}>
                   <CheckIcon className="h-5 w-5"/>
                  </button>
                ) :(<button className="text-blue-500 border hover:text-blue-700 p-2 rounded" onClick={() => handleEdit(row.id)}>
                <PencilIcon className="h-5 w-5" />
              </button>)}
              <button className="text-red-500 hover:text-red-700 ml-2 border p-2 rounded" onClick={() => handleDelete(row.id)}>
                <TrashIcon className="h-5 w-5" />
              </button></td>
              
            </tr>
          ))}
        </tbody>
    </table>:<div className='italic text-center border p-10'>No results</div>}
   <div className='flex justify-between'>
    <p className='italic text-sm mt-4'>{`${selectedRows.length} out of ${filteredData.length}`}</p>
     {totalPages>1? <div className="mt-4">
        <nav className="flex justify-center">
        
        <button
          className="mx-1 px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
        >
         &lt;&lt;
        </button>
        <button
          className="mx-1 px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 text-sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
         &lt;
        </button>
          {Array.from({ length: totalPages }, (_, index)=> (
            <button
              key={index}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700  hover:bg-gray-400'
              }`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
          className="mx-1 px-3 py-1 rounded bg-gray-300 text-gray-700  hover:bg-gray-400 text-sm"
          onClick={goToNextPage}
          disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
        >
         &gt;
        </button>
        <button
          className="mx-1 px-3 py-1 rounded bg-gray-300 text-gray-700  hover:bg-gray-400 text-sm"
          onClick={goToLastPage}
          disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
        >
         &gt;&gt;
        </button>
      
        </nav>
      </div>:<></>}</div>
    
    </div>
  )
}

export default Table