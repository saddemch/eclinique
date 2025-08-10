// components/Button.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextStyle,
    ViewStyle
} from "react-native";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 14,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      opacity: disabled ? 0.6 : 1,
    };

    // Styles par variant
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: "#2563eb",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
      secondary: {
        backgroundColor: "#0ea5e9",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#2563eb",
      },
      danger: {
        backgroundColor: "#dc2626",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
      success: {
        backgroundColor: "#059669",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
    };

    // Styles par taille
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      medium: {
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      large: {
        paddingVertical: 18,
        paddingHorizontal: 24,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      width: fullWidth ? "100%" : undefined,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: "700",
      textAlign: "center",
    };

    // Couleurs par variant
    const variantTextColors: Record<string, TextStyle> = {
      primary: { color: "#fff" },
      secondary: { color: "#fff" },
      ghost: { color: "#2563eb" },
      danger: { color: "#fff" },
      success: { color: "#fff" },
    };

    // Tailles par variant
    const sizeTextStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    return {
      ...baseTextStyle,
      ...variantTextColors[variant],
      ...sizeTextStyles[size],
      ...textStyle,
    };
  };

  const getIconColor = (): string => {
    const variantIconColors: Record<string, string> = {
      primary: "#fff",
      secondary: "#fff",
      ghost: "#2563eb",
      danger: "#fff",
      success: "#fff",
    };
    return variantIconColors[variant] || "#fff";
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    const iconSize = size === "small" ? 16 : size === "medium" ? 18 : 20;
    const iconStyle = { marginRight: iconPosition === "left" ? 8 : 0, marginLeft: iconPosition === "right" ? 8 : 0 };

    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={getIconColor()}
        style={iconStyle}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator size="small" color={getIconColor()} style={{ marginRight: 8 }} />
          <Text style={getTextStyle()}>Chargement...</Text>
        </>
      );
    }

    return (
      <>
        {iconPosition === "left" && renderIcon()}
        <Text style={getTextStyle()}>{title}</Text>
        {iconPosition === "right" && renderIcon()}
      </>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && { opacity: 0.9 },
      ]}
    >
      {renderContent()}
    </Pressable>
  );
}

// Composants spécialisés pour une utilisation plus simple
export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="secondary" />;
}

export function GhostButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="ghost" />;
}

export function DangerButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="danger" />;
}

export function SuccessButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="success" />;
}

