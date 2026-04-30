import { useState } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function UserFormFields({ values, errors, touched, handleChange, handleBlur, roles, isEdit, disableRole }) {
  const [showPassword, setShowPassword] = useState(false);

  const getFieldError = (field) => touched[field] && Boolean(errors[field]);
  const getFieldHelper = (field) => (touched[field] && errors[field]) || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          name="firstName"
          label="First Name"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getFieldError('firstName')}
          helperText={getFieldHelper('firstName')}
        />
        <TextField
          fullWidth
          name="lastName"
          label="Last Name"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getFieldError('lastName')}
          helperText={getFieldHelper('lastName')}
        />
      </Box>
      <TextField
        fullWidth
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getFieldError('email')}
        helperText={getFieldHelper('email')}
      />
      <TextField
        fullWidth
        name="username"
        label="Username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getFieldError('username')}
        helperText={getFieldHelper('username')}
      />
      {!isEdit && (
        <FormControl fullWidth variant="outlined" error={getFieldError('password')}>
          <InputLabel htmlFor="password-field">Password</InputLabel>
          <OutlinedInput
            id="password-field"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          {getFieldHelper('password') && (
            <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5, ml: 1.5 }}>{errors.password}</Box>
          )}
        </FormControl>
      )}
      {isEdit && (
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="password-field-edit">Password</InputLabel>
          <OutlinedInput
            id="password-field-edit"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Leave blank to keep current"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          {getFieldHelper('password') && (
            <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5, ml: 1.5 }}>{errors.password}</Box>
          )}
        </FormControl>
      )}
      <FormControl fullWidth error={getFieldError('roleId')} disabled={disableRole}>
        <InputLabel>Role</InputLabel>
        <Select name="roleId" value={values.roleId} onChange={handleChange} onBlur={handleBlur} label="Role">
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
        {getFieldHelper('roleId') && (
          <Box sx={{ color: 'error.main', fontSize: 12, mt: 0.5, ml: 1.5 }}>{errors.roleId}</Box>
        )}
      </FormControl>
      <FormControlLabel
        control={<Switch checked={values.enabled} onChange={handleChange} name="enabled" color="primary" />}
        label="Enabled"
      />
    </Box>
  );
}
