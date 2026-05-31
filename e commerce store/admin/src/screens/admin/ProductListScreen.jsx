import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen } from 'react-icons/fa';
import {
    useGetProductsQuery,
    useCreateProductMutation,
    useDeleteProductMutation,
} from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';
import EmptyState from '../../components/EmptyState';

const ProductListScreen = () => {
    const { data, isLoading, error, refetch } = useGetProductsQuery({ pageNumber: 1 });

    const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
    const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id).unwrap();
                toast.success('Product deleted successfully');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const createProductHandler = async () => {
        if (window.confirm('Are you sure you want to create a new product?')) {
            try {
                await createProduct().unwrap();
                toast.success('Sample product created. Click edit to modify it.');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <div className="admin-shell animate-fade-in">
            <div className="admin-header">
                <div>
                    <h1>Products</h1>
                    <p>Create, edit and organize all items in your catalog.</p>
                </div>
                <div className="admin-header-actions">
                    <button
                        className="admin-chip"
                        onClick={createProductHandler}
                        disabled={loadingCreate}
                    >
                        <FaPlus /> {loadingCreate ? 'Creating...' : 'Create product'}
                    </button>
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
            ) : data && data.products && data.products.length === 0 ? (
                <EmptyState
                    title="No Products Found"
                    message="There are no products available. Start by creating a new product."
                    icon={FaBoxOpen}
                />
            ) : (
                <div className="glass overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-surface-color/50 border-b border-white/10 uppercase text-xs tracking-wider">
                                    <th className="p-4 font-bold text-slate-400">ID</th>
                                    <th className="p-4 font-bold text-slate-400">Name</th>
                                    <th className="p-4 font-bold text-slate-400">Price</th>
                                    <th className="p-4 font-bold text-slate-400">Category</th>
                                    <th className="p-4 font-bold text-slate-400">Brand</th>
                                    <th className="p-4 font-bold text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-xs text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
                                            {product._id}
                                        </td>
                                        <td className="p-4 font-semibold text-slate-100">
                                            {product.name}
                                        </td>
                                        <td className="p-4 text-gradient font-bold">
                                            ${product.price}
                                        </td>
                                        <td className="p-4 text-slate-300">{product.category}</td>
                                        <td className="p-4 text-slate-300">{product.brand}</td>
                                        <td className="p-4">
                                            <div className="flex gap-3">
                                                <Link
                                                    to={`/admin/product/${product._id}/edit`}
                                                    className="p-2.5 bg-surface-color/50 hover:bg-primary-color/20 rounded-lg text-slate-300 hover:text-primary-color transition-colors border border-white/5 hover:border-primary-color/30"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    className="p-2.5 bg-danger/10 hover:bg-danger/20 rounded-lg text-danger hover:text-red-400 transition-colors border border-danger/10 hover:border-danger/30"
                                                    onClick={() => deleteHandler(product._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListScreen;
