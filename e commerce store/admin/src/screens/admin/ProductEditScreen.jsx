import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
      }).unwrap();
      toast.success('Product updated successfully');
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="admin-shell animate-fade-in">
      <div className="mb-6">
        <Link to="/admin/productlist" className="btn-pill inline-flex items-center gap-2">
          <FaArrowLeft /> Go Back
        </Link>
      </div>

      <div className="admin-header">
        <div>
          <h1>Edit Product</h1>
          <p>Modify product details and update stock information.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loader">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert-error">
          {error?.data?.message || error.error}
        </div>
      ) : (
        <div className="glass p-8 max-w-4xl mx-auto border border-white/5 shadow-2xl">
          <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="auth-field">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Price ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="Enter brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Stock Count</label>
                <input
                  type="number"
                  placeholder="0"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="auth-field">
                <label>Category</label>
                <input
                  type="text"
                  placeholder="Enter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="mt-4">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                    <FaCloudUploadAlt className="text-2xl text-primary-color" />
                    <span className="text-sm font-medium">
                      {loadingUpload ? 'Uploading...' : 'Choose File to Upload'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={uploadFileHandler}
                    />
                  </label>
                </div>
              </div>

              <div className="auth-field">
                <label>Description</label>
                <textarea
                  className="w-full bg-surface-color/50 border border-white/10 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-primary-color/50 text-slate-100"
                  placeholder="Describe the product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loadingUpdate}
                className="btn-pill btn-pill-primary w-full justify-center py-4 text-lg"
              >
                <FaSave /> {loadingUpdate ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductEditScreen;
