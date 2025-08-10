// components/FormInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";

export interface FormInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
  required?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: ViewStyle;
  errorStyle?: ViewStyle;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
}

export default function FormInput({
  label,
  error,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = "outlined",
  size = "medium",
  secureTextEntry,
  ...textInputProps
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: 16,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getLabelStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: "#475569",
    };

    if (required) {
      baseStyle.color = "#dc2626";
    }

    return {
      ...baseStyle,
      ...labelStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      outlined: {
        borderWidth: 1,
        borderColor: error ? "#dc2626" : isFocused ? "#2563eb" : "#cbd5e1",
        borderRadius: 12,
        backgroundColor: "#fff",
      },
      filled: {
        borderWidth: 1,
        borderColor: error ? "#dc2626" : isFocused ? "#2563eb" : "#e2e8f0",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
      },
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 20,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      fontSize: 16,
      color: "#0f172a",
      paddingLeft: leftIcon ? 40 : 0,
      paddingRight: (rightIcon || secureTextEntry) ? 40 : 0,
    };

    return {
      ...baseStyle,
      ...inputStyle,
    };
  };

  const getErrorStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      color: "#dc2626",
      fontSize: 12,
      marginTop: 6,
      marginLeft: 4,
    };

    return {
      ...baseStyle,
      ...errorStyle,
    };
  };

  const handleFocus = () => {
    setIsFocused(true);
    textInputProps.onFocus?.(undefined as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    textInputProps.onBlur?.(undefined as any);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={styles.leftIcon}>
        <Ionicons name={leftIcon} size={18} color="#64748b" />
      </View>
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <Pressable onPress={togglePasswordVisibility} style={styles.rightIcon}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#64748b"
          />
        </Pressable>
      );
    }

    if (rightIcon) {
      return (
        <Pressable
          onPress={onRightIconPress}
          style={[styles.rightIcon, onRightIconPress && styles.clickableIcon]}
        >
          <Ionicons name={rightIcon} size={18} color="#64748b" />
        </Pressable>
      );
    }

    return null;
  };

  const finalSecureTextEntry = secureTextEntry && !showPassword;

  return (
    <View style={getContainerStyle()}>
      <Text style={getLabelStyle()}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={getInputContainerStyle()}>
        {renderLeftIcon()}
        
        <TextInput
          {...textInputProps}
          style={getInputStyle()}
          secureTextEntry={finalSecureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#94a3b8"
        />
        
        {renderRightIcon()}
      </View>
      
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  leftIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  
  rightIcon: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  
  clickableIcon: {
    paddingHorizontal: 8,
  },
  
  required: {
    color: "#dc2626",
  },
});

