import {useState} from 'react';
import api from '../api/axios.js'
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import {useNavigate} from 'react-router-dom';





export default function Register(){

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [formData , setFormData]  = useState({
    'name':"",
    'email':"",
    'password':""
  })



  const handlechange = (e) => {
    // get name and values from the event e 
    const {name , value} = e.target;


    setFormData({...formData , 
      [name]:value ,
    })

  }



  const handlesubmit = async (e) => {

    e.preventDefault();

    try{

      // make a api call to send the formData

      const response = await api.post('api/auth/signup' , formData);
      dispatch(setCredentials({
         token: response.data.token, 
         user: response.data.user.email
      }));

      navigate('/dashboard');



      console.log(response);
      if(response) {

        alert("Registration Successfull");
      }

    }catch(err){
      console.error('Registration Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }

  }





  return (
    <div  className="min-h-screen flex justify-center items-center bg-gray-100">

      {/** thi is the login card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        {/** this is the title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800"> 
            Register Yourself
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome Back to DevMind
          </p>

        </div>



        {/** this is the login  form */}
        <form className="flex flex-col gap-4 " onSubmit={handlesubmit} onChange={handlechange}>

          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          
          <input

          type="text"
          name="name"
          placeholder="Enter your Name .."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          value={formData.name}
          />


          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          
          <input

          type="email"
          name="email"
          placeholder="Enter your Email .."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          value={formData.email}
          />


          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          
          <input

          type="password"
          name="password"
          placeholder="Password "
          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          value={formData.password}
          />


          <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          
          >
          Register
          </button>




        </form>

        <button
          type="button"
          className="w-full mt-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          onClick ={()=> navigate('/login')}
        >
          Login In Your Account
        </button>

      </div>

    </div>
  )
}