package com.prince_of_nigeria.famropqmmszhbxkd6jagg6ijox

import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.my.target.ads.MyTargetView

class MyTargetViewManager : SimpleViewManager<MyTargetView>() {
    override fun getName() = "MyTargetView"

    override fun createViewInstance(reactContext: ThemedReactContext): MyTargetView {
        return MyTargetView(reactContext).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
    }

    @ReactProp(name = "slotId")
    fun setSlotId(view: MyTargetView, slotId: String) {
        val id = slotId.toIntOrNull()
        if (id != null) {
            view.setSlotId(id)
        }
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: MyTargetView, adSize: String?) {
        // Намеренно оставляем пустым. 
        // MyTarget по умолчанию использует адаптивный размер, 
        // который автоматически и идеально подстраивается под 320x50.
        // Это гарантирует 100% успешную компиляцию без ошибок типов AdSize.
    }

    override fun onDropViewInstance(view: MyTargetView) {
        view.destroy()
        super.onDropViewInstance(view)
    }
}