"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import type { CuentaBancaria, Informacion } from "@/lib/types";
import * as s from "../../admin-styles";

interface InformacionFormProps {
  informacion: Informacion;
  action: (formData: FormData) => Promise<void>;
}

const CUENTA_VACIA: CuentaBancaria = { banco: "", tipo_cuenta: "", numero_cuenta: "", identificacion: "" };

export function InformacionForm({ informacion, action }: InformacionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>(
    informacion.cuentas_bancarias?.length ? informacion.cuentas_bancarias : []
  );

  const setCuentaCampo = (i: number, campo: keyof CuentaBancaria) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCuentas((cs) => cs.map((c, idx) => (idx === i ? { ...c, [campo]: e.target.value } : c)));

  const quitarCuenta = (i: number) => setCuentas((cs) => cs.filter((_, idx) => idx !== i));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const cuentasValidas = cuentas.filter((c) => c.banco.trim() && c.numero_cuenta.trim());
      formData.set("cuentas_bancarias", JSON.stringify(cuentasValidas));
      await action(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}
      {saved && !error && (
        <div style={{ ...s.errorBox, background: "rgba(139,183,139,0.1)", borderColor: "rgba(139,183,139,0.35)", color: "#9fcf9f" }}>
          Guardado. Los cambios ya se ven en la página de inicio.
        </div>
      )}

      <label style={s.label}>Título de la sección</label>
      <input name="titulo" required defaultValue={informacion.titulo} className="admin-input" style={s.input} />

      <label style={s.label}>Descripción</label>
      <textarea
        name="descripcion"
        defaultValue={informacion.descripcion}
        rows={5}
        className="admin-input"
        style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }}
      />

      <label style={s.label}>Dirección</label>
      <input name="direccion" defaultValue={informacion.direccion} className="admin-input" style={s.input} />

      <label style={s.label}>Horario de atención</label>
      <input name="horario" placeholder="Ej: Lunes a sábado, 9:00 - 19:00" defaultValue={informacion.horario} className="admin-input" style={s.input} />

      <label style={s.label}>Teléfono</label>
      <input name="telefono" defaultValue={informacion.telefono} className="admin-input" style={s.input} />

      <input type="hidden" name="foto_url_actual" defaultValue={informacion.foto_url ?? ""} />

      <label style={s.label}>Foto del salón</label>
      {informacion.foto_url && (
        <Image
          src={informacion.foto_url}
          alt="Salón Dimesa"
          width={160}
          height={128}
          style={{ width: "160px", height: "128px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(201,168,118,0.22)", marginBottom: "10px", display: "block" }}
        />
      )}
      <input name="foto" type="file" accept="image/*" className="admin-input" style={{ ...s.input, padding: "10px 14px" }} />
      <div style={s.helpText}>
        {informacion.foto_url ? "Deja vacío para mantener la foto actual." : "Se muestra en la sección \"Quiénes Somos\" de /informacion."}
      </div>

      <div style={{ ...s.label, fontSize: "13px", textTransform: "none", letterSpacing: "0.02em", margin: "38px 0 4px", color: "#e6d3ac" }}>
        Cuentas para pagos por transferencia
      </div>
      <div style={s.helpText}>Se le muestran al cliente en el checkout cuando elige pagar por transferencia.</div>

      {cuentas.map((cuenta, i) => (
        <div
          key={i}
          style={{
            marginTop: "18px",
            padding: "18px",
            border: "1px solid rgba(201,168,118,0.18)",
            borderRadius: "8px",
            background: "rgba(201,168,118,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ ...s.label, margin: 0 }}>Cuenta {i + 1}</div>
            <button
              type="button"
              onClick={() => quitarCuenta(i)}
              className="admin-btn-danger"
              style={{ ...s.dangerButton, ...s.smallButton }}
            >
              Quitar
            </button>
          </div>

          <label style={s.label}>Banco</label>
          <input value={cuenta.banco} onChange={setCuentaCampo(i, "banco")} className="admin-input" style={s.input} />

          <label style={s.label}>Tipo de cuenta</label>
          <input
            value={cuenta.tipo_cuenta}
            onChange={setCuentaCampo(i, "tipo_cuenta")}
            placeholder="Ej: Cuenta de ahorros"
            className="admin-input"
            style={s.input}
          />

          <label style={s.label}>Número de cuenta</label>
          <input value={cuenta.numero_cuenta} onChange={setCuentaCampo(i, "numero_cuenta")} className="admin-input" style={s.input} />

          <label style={s.label}>Cédula / RUC</label>
          <input value={cuenta.identificacion} onChange={setCuentaCampo(i, "identificacion")} className="admin-input" style={s.input} />
        </div>
      ))}

      <button
        type="button"
        onClick={() => setCuentas((cs) => [...cs, { ...CUENTA_VACIA }])}
        className="admin-btn-secondary"
        style={{ ...s.secondaryButton, marginTop: "16px", alignSelf: "flex-start" }}
      >
        + Agregar cuenta
      </button>

      <div style={s.formActions}>
        <button type="submit" disabled={submitting} className="admin-btn-primary" style={{ ...s.primaryButton, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
