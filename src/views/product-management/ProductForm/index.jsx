import { useState, useEffect, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { FieldArray, Formik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router';

import { IconArrowLeft, IconPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { SUPPORTED_LANGUAGES } from 'config/languages';
import * as productsApi from 'api/products';
import * as categoriesApi from 'api/categories';
import * as storesApi from 'api/stores';
import { getFileUrl } from 'api/files';
import ImageUploadSection from './ImageUploadSection';
import VariantSection from './VariantSection';

function buildNamesSchema(label) {
  const shape = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    shape[lang.code] = yup.string().required(`${lang.label} ${label} is required`);
  });
  return yup.object(shape);
}

const validationSchema = yup.object({
  names: buildNamesSchema('name'),
  descriptions: buildNamesSchema('description'),
  categoryId: yup.string().required('Category is required'),
  imageIds: yup.array().min(1, 'At least one image is required'),
  variants: yup
    .array()
    .min(1, 'At least one variant is required')
    .of(
      yup.object({
        price: yup.number().typeError('Price must be a number').required('Price is required').positive('Price must be positive'),
        stockQuantity: yup
          .number()
          .typeError('Stock must be a number')
          .required('Stock quantity is required')
          .integer('Stock must be a whole number')
          .min(0, 'Stock cannot be negative'),
        attributes: yup.array().of(
          yup.object({
            productFilterId: yup.string().required(),
            value: yup.string().required('Value is required')
          })
        ),
        imageIds: yup.array().of(yup.string()),
        storeIds: yup.array().of(yup.string())
      })
    )
});

function buildInitialNames() {
  const names = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    names[lang.code] = '';
  });
  return names;
}

function buildEmptyVariant(filterIds = []) {
  return {
    price: '',
    stockQuantity: '',
    attributes: filterIds.map((filterId) => ({ productFilterId: filterId, value: '' })),
    imageIds: [],
    storeIds: [],
    _imagePreviews: []
  };
}

function mapProductToFormValues(product) {
  return {
    names: product.names || buildInitialNames(),
    descriptions: product.descriptions || buildInitialNames(),
    categoryId: product.category?.id || '',
    imageIds: (product.images || []).map((img) => img.id),
    _imagePreviews: (product.images || []).map((img) => ({ id: img.id, url: getFileUrl(img.id), name: img.originalFilename })),
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      price: v.price ?? '',
      stockQuantity: v.stockQuantity ?? '',
      attributes: (v.attributes || []).map((a) => ({
        id: a.id,
        productFilterId: a.productFilterId || a.productFilter?.id || '',
        value: a.value || ''
      })),
      imageIds: (v.images || []).map((img) => img.id),
      storeIds: (v.stores || []).map((s) => s.id),
      _imagePreviews: (v.images || []).map((img) => ({ id: img.id, url: getFileUrl(img.id), name: img.originalFilename }))
    }))
  };
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((data) => setCategories(data.content || data || []))
      .catch(() => {});
    storesApi
      .getStores()
      .then((data) => setStores(data.content || data || []))
      .catch(() => {});
  }, []);

  const fetchCategoryFilters = useCallback(async (categoryId) => {
    if (!categoryId) {
      setCategoryFilters([]);
      return;
    }
    try {
      const data = await categoriesApi.getCategoryFilters(categoryId);
      const filters = data.content || data || [];
      setCategoryFilters(filters);
      return filters;
    } catch {
      setCategoryFilters([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoadingProduct(true);
      productsApi
        .getProduct(id)
        .then(async (product) => {
          const formValues = mapProductToFormValues(product);
          setInitialValues(formValues);
          if (formValues.categoryId) {
            await fetchCategoryFilters(formValues.categoryId);
          }
        })
        .catch(() => {
          setError('Failed to load product');
        })
        .finally(() => setLoadingProduct(false));
    } else {
      setInitialValues({
        names: buildInitialNames(),
        descriptions: buildInitialNames(),
        categoryId: '',
        imageIds: [],
        _imagePreviews: [],
        variants: [buildEmptyVariant()]
      });
    }
  }, [isEdit, id, fetchCategoryFilters]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      const variants = values.variants.map((v) => {
        const variant = {
          price: Number(v.price),
          stockQuantity: Number(v.stockQuantity),
          attributes: v.attributes.filter((a) => a.value).map((a) => ({ productFilterId: a.productFilterId, value: a.value })),
          imageIds: v.imageIds || [],
          storeIds: v.storeIds || []
        };
        if (v.id) variant.id = v.id;
        return variant;
      });

      const payload = {
        names: values.names,
        descriptions: values.descriptions,
        categoryId: values.categoryId,
        imageIds: values.imageIds,
        variants
      };

      if (isEdit) {
        await productsApi.updateProduct(id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct || !initialValues) {
    return (
      <Grid container spacing={gridSpacing}>
        <Grid size={12}>
          <MainCard title={isEdit ? 'Edit Product' : 'Create Product'}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard
          title={isEdit ? 'Edit Product' : 'Create Product'}
          secondary={
            <Button startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          }
        >
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof error === 'string' ? error : `Failed to ${isEdit ? 'update' : 'create'} product`}
                  </Alert>
                )}

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <TextField
                      key={`name-${lang.code}`}
                      fullWidth
                      size="small"
                      name={`names.${lang.code}`}
                      label={`Name (${lang.label})`}
                      value={values.names?.[lang.code] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.names?.[lang.code] && Boolean(errors.names?.[lang.code])}
                      helperText={touched.names?.[lang.code] && errors.names?.[lang.code]}
                    />
                  ))}
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <TextField
                      key={`desc-${lang.code}`}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      name={`descriptions.${lang.code}`}
                      label={`Description (${lang.label})`}
                      value={values.descriptions?.[lang.code] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.descriptions?.[lang.code] && Boolean(errors.descriptions?.[lang.code])}
                      helperText={touched.descriptions?.[lang.code] && errors.descriptions?.[lang.code]}
                    />
                  ))}
                  <FormControl fullWidth size="small" error={touched.categoryId && Boolean(errors.categoryId)}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="categoryId"
                      value={values.categoryId}
                      onChange={async (e) => {
                        handleChange(e);
                        const filters = await fetchCategoryFilters(e.target.value);
                        const filterIds = (filters || []).map((f) => f.id);
                        setFieldValue(
                          'variants',
                          values.variants.map((v) => ({
                            ...v,
                            attributes: filterIds.map((fid) => {
                              const existing = v.attributes?.find((a) => a.productFilterId === fid);
                              return existing || { productFilterId: fid, value: '' };
                            })
                          }))
                        );
                      }}
                      onBlur={handleBlur}
                      label="Category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.names?.en || cat.id}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.categoryId && errors.categoryId && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                        {errors.categoryId}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Product Images
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <ImageUploadSection
                    imageIds={values.imageIds}
                    imagePreviews={values._imagePreviews}
                    onChange={(ids, previews) => {
                      setFieldValue('imageIds', ids);
                      setFieldValue('_imagePreviews', previews);
                    }}
                    error={touched.imageIds && typeof errors.imageIds === 'string' ? errors.imageIds : undefined}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />
                <FieldArray name="variants">
                  {({ push, remove }) => (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Variants
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<IconPlus size={16} />}
                          onClick={() => {
                            const filterIds = categoryFilters.map((f) => f.id);
                            push(buildEmptyVariant(filterIds));
                          }}
                        >
                          Add Variant
                        </Button>
                      </Box>
                      {typeof errors.variants === 'string' && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          {errors.variants}
                        </Alert>
                      )}
                      {values.variants.map((variant, index) => (
                        <VariantSection
                          key={index}
                          index={index}
                          categoryFilters={categoryFilters}
                          stores={stores}
                          values={variant}
                          errors={errors}
                          touched={touched}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          setFieldValue={setFieldValue}
                          onRemove={() => remove(index)}
                          canRemove={values.variants.length > 1}
                        />
                      ))}
                    </>
                  )}
                </FieldArray>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button onClick={() => navigate('/products')} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
                  >
                    {isEdit ? 'Save Changes' : 'Create Product'}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>
    </Grid>
  );
}
